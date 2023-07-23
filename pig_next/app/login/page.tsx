"use client";

import { Field, Form, Formik } from "formik";
import SubmitButton from "../../components/SubmitButton";
import { useUserAuth } from "../../store/userStore";
import { useRouter } from "next/navigation";

export default function Login() {
  const { login } = useUserAuth();
  const router = useRouter();

  return (
    <main className="mx-auto flex h-[100vh] w-full flex-col items-center justify-center gap-8 overflow-hidden bg-stone-950 px-4 py-14 sm:w-[640px]">
      <div className="flex w-full flex-col items-center gap-4">
        <h1 className="text-4xl font-bold text-stone-200">Login</h1>
        <span className="text-sm text-stone-400">
          Use your bank account to use PIG services
        </span>
      </div>
      <Formik
        initialValues={{ cbu: "", password: "", alias: "" }}
        onSubmit={async (values) => {
          try {
            if (await login(values)) router.push("/");
            else {
              alert("Wrong credentials");
            }
          } catch (e) {
            alert("There was a problem with the server");
          }
        }}
      >
        <Form className="flex w-[20rem] flex-col">
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-stone-500">Cbu</span>
              <Field
                name="cbu"
                id="cbu"
                className="h-[3rem] rounded-lg border-2 border-stone-800 bg-transparent px-4 py-2 focus:outline-none"
                type="text"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-stone-500">Password</span>
              <Field
                name="password"
                id="password"
                className="h-[3rem] rounded-lg border-2 border-stone-800 bg-transparent px-4 py-2 focus:outline-none"
                type="password"
              />
            </label>
            <hr className="h-0.5 border-stone-900 bg-stone-900" />
            <label className="flex flex-col  gap-2">
              <span className="text-stone-500">Alias</span>
              <Field
                name="alias"
                id="alias"
                className="h-[3rem] rounded-lg border-2 border-stone-800 bg-transparent px-4 py-2 focus:outline-none"
                type="text"
              />
              <span className="text-center text-sm text-stone-600">
                Pick an alias!
              </span>
            </label>
            <SubmitButton />
          </div>
        </Form>
      </Formik>
    </main>
  );
}
