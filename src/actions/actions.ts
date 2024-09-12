"use server";
import { signIn, signOut } from "@/lib/auth";
import prisma from "@/lib/db";
import { checkAuth, getPetById } from "@/lib/server-utils";
import { sleep } from "@/lib/utils";
import { authSchema, petFormSchema, petIdSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function logIn(prevState: unknown, formData: unknown) {
  if (!(formData instanceof FormData)) {
    return {
      message: "Invalid form data.",
    };
  }
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { message: "Invalid credentials." };
        default: {
          return {
            message: "Error. Could not sign in.",
          };
        }
      }
    }

    throw error; // NextJS redirect() throws an error by default, so we need to rethrow it
  }
}

export async function logOut() {
  await signOut({ redirectTo: "/" });
}

export async function signUp(prevState: unknown, formData: unknown) {
  if (!(formData instanceof FormData)) {
    return {
      message: "Invalid form data.",
    };
  }
  const formDataObject = Object.fromEntries(formData.entries());
  const validatedFormData = authSchema.safeParse(formDataObject);
  if (!validatedFormData.success) {
    return {
      message: "Invalid form data.",
    };
  }
  const { email, password } = validatedFormData.data;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await prisma.user.create({
      data: {
        email,
        hashedPassword,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          message: "Email already exists.",
        };
      }
      if (error.code === "P2003") {
        return {
          message: "Invalid email.",
        };
      }
      if (error.code === "P2004") {
        return {
          message: "Invalid password.",
        };
      }
    }
    return {
      message: "Could not create user.",
    };
  }

  await signIn("credentials", formData);
}

export async function addPet(pet: unknown) {
  const session = await checkAuth();

  const validatedPet = petFormSchema.safeParse(pet);

  if (!validatedPet.success) {
    return {
      message: "Invalid pet data.",
    };
  }

  try {
    await prisma.pet.create({
      data: {
        ...validatedPet.data,
        user: {
          connect: {
            id: session.user.id,
          },
        },
      },
    });
    revalidatePath("/app", "layout");
  } catch (error) {
    console.log(error);
    return {
      message: "Could not add pet.",
    };
  }
}

export async function editPet(petId: unknown, newPetData: unknown) {
  const session = await checkAuth();
  const validatedPetId = petIdSchema.safeParse(petId);
  const validatedPet = petFormSchema.safeParse(newPetData);
  if (!validatedPet.success || !validatedPetId.success) {
    return {
      message: "Invalid pet data.",
    };
  }

  const pet = await getPetById(validatedPetId.data);

  if (!pet) {
    return {
      message: "Pet not found.",
    };
  }

  try {
    await prisma.pet.update({
      where: {
        id: validatedPetId.data,
      },
      data: validatedPet.data,
    });
  } catch (error) {
    return {
      message: "Could not edit pet.",
    };
  }
  revalidatePath("/app", "layout");
}

export async function deletePet(petId: unknown) {
  const session = await checkAuth();

  const validatedPetId = petIdSchema.safeParse(petId);
  if (!validatedPetId.success) {
    return {
      message: "Invalid pet data.",
    };
  }

  const pet = await getPetById(validatedPetId.data);

  if (!pet) {
    return {
      message: "Pet not found.",
    };
  }
  if (pet.userId !== session.user.id) {
    return {
      message: "Not authorized.",
    };
  }

  try {
    await prisma.pet.delete({
      where: {
        id: validatedPetId.data,
      },
    });
  } catch (error) {
    return {
      message: "Could not delete pet.",
    };
  }
  revalidatePath("/app", "layout");
}

export async function createCheckoutSession() {
  const session = await checkAuth();
  const checkoutSession = await stripe.checkout.sessions.create({
    customer_email: session.user.email,
    line_items: [
      {
        price: "price_1PxpQmGdS9OGnI2ymLRLFRcG",
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.BASE_URL}/payment?success=true`,
    cancel_url: `${process.env.BASE_URL}/payment?cancelled=true`,
  });
  redirect(checkoutSession.url);
}
