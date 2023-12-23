"use client";

import { Field, Form, Formik } from "formik";
import SubmitButton from "../../components/SubmitButton";
import { useUserAuth } from "../../store/userStore";
import { useRouter } from "next/navigation";
import * as Yup from "yup";
import { useAlertHandler } from "../../store/useAlertHandler";
import AlertHandler from "../../components/AlertHandler";
import { useEffect } from "react";

const validationSchema = Yup.object().shape({
  cbu: Yup.string()
    .length(22, "Cbu must be 22 characters long")
    .required("Required"),
  password: Yup.string()
    .min(3, "Password must be at least 8 characters long")
    .max(20, "Password must be at most 20 characters long")
    .required("Required"),
  alias: Yup.string()
    .min(3, "Alias must be at least 3 characters long")
    .max(20, "Alias must be at most 20 characters long"),
});

export default function Login() {
  const { login, user } = useUserAuth();
  const router = useRouter();
  const { setAlert, alerts } = useAlertHandler();

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user]);

  return (
    <>
      <AlertHandler />
      <main className="mx-auto flex h-[100vh] w-full flex-col items-center justify-center gap-8 overflow-hidden bg-stone-950 px-4 py-14 sm:w-[640px]">
        <div className="flex w-full flex-col items-center gap-4">
          <h1 className="text-4xl font-bold text-stone-200">Login</h1>
          <span className="text-sm text-stone-400">
            Use your bank account to use PIG services
          </span>
        </div>
        <Formik
          initialValues={{ cbu: "", password: "", alias: "" }}
          validationSchema={validationSchema}
          onSubmit={async (values) => {
            try {
              if (await login(values)) {
                router.push("/");
                setAlert({
                  message: "Login successful",
                  isError: false,
                });
              }
            } catch (e) {
              console.log(e);
              setAlert({
                message: "Something went wrong",
                isError: true,
              });
            }
          }}
        >
          {({ errors, touched }) => (
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
                  {errors.cbu && touched.cbu && (
                    <span className="text-sm text-red-600">{errors.cbu}</span>
                  )}
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-stone-500">Password</span>
                  <Field
                    name="password"
                    id="password"
                    className="h-[3rem] rounded-lg border-2 border-stone-800 bg-transparent px-4 py-2 focus:outline-none"
                    type="password"
                  />
                  {errors.password && touched.password && (
                    <span className="text-sm text-red-600">
                      {errors.password}
                    </span>
                  )}
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
                  {errors.alias && touched.alias && (
                    <span className="text-sm text-red-600">{errors.alias}</span>
                  )}

                  <span className="text-center text-sm text-stone-600">
                    Pick an alias!
                  </span>
                </label>
                <SubmitButton />
              </div>
            </Form>
          )}
        </Formik>
      </main>
    </>
  );
}
