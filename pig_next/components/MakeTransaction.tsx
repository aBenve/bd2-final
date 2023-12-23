"use client";

import { Field, Form, Formik } from "formik";
import { useMakeTransactionMutation } from "../mutations/useMakeTransactionMutation";
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
  identifier: Yup.string().required("Required"),
  amount: Yup.number()
    .min(0.01, "The minimum amount posible is $0.01")
    .max(1000000, "The maximun amount posible is $1.000.000")
    .required("Required"),
});

function MakeTransaction() {
  const makeTransactionMutation = useMakeTransactionMutation();

  return (
    <div className=" flex h-full w-full flex-col gap-4">
      <span className="text-stone-500">Make a transaction</span>
      <Formik
        initialValues={{ identifierType: "name", identifier: "", amount: "" }}
        validationSchema={validationSchema}
        onSubmit={(values, helpers) => {
          makeTransactionMutation.mutate({
            destinationIdentifierType: values.identifierType,
            destinationIdentifier: values.identifier,
            balance: parseFloat(values.amount),
          });
          helpers.resetForm();
        }}
      >
        {({ errors, touched }) => (
          <Form className="flex w-full flex-col items-center gap-4">
            <div className="flex w-full items-start gap-4">
              <Field
                name="identifierType"
                as="select"
                default="name"
                className="block h-[3rem] rounded-lg bg-stone-900  px-4 py-2 text-pink-400 focus:outline-none "
              >
                <option value="phone">Phone</option>
                <option value="email">Email</option>
                <option value="name">Name</option>
                <option value="alias">Alias</option>
                <option value="cbu">Cbu</option>
              </Field>
              <div className="flex w-full flex-col">
                <Field
                  name="identifier"
                  placeholder="Enter an identifier"
                  className="h-[3rem] w-full rounded-lg bg-stone-900
                px-4 py-2  text-stone-100  focus:outline-none"
                />
                {errors.identifier && touched.identifier && (
                  <span className="text-sm text-red-600">
                    {errors.identifier}
                  </span>
                )}
              </div>
            </div>
            <div className="w-full">
              <Field
                name="amount"
                type="number"
                placeholder="Enter an amount"
                className="h-[3rem] w-full rounded-lg bg-stone-900 px-4 py-2 text-stone-100
              [appearance:textfield] focus:outline-none  [&::-webkit-inner-spin-button]:appearance-none  [&::-webkit-outer-spin-button]:appearance-none"
              />
              {errors.amount && touched.amount && (
                <span className="text-sm text-red-600">{errors.amount}</span>
              )}
            </div>

            <button
              type="submit"
              className="h-[3rem] w-full rounded-lg bg-pink-400
            px-4 py-2 font-bold text-stone-100  focus:outline-none"
            >
              Send
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default MakeTransaction;
