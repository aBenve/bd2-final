"use client";

import { Field, Form, Formik } from "formik";
import { useMakeTransactionMutation } from "../mutations/useMakeTransactionMutation";

function MakeTransaction() {
  const makeTransactionMutation = useMakeTransactionMutation();

  return (
    <div className=" flex h-full w-full flex-col gap-4">
      <span className="text-stone-500">Make a transaction</span>
      <Formik
        initialValues={{ identifierType: "name", identifier: "", amount: "" }}
        onSubmit={(values, helpers) => {
          makeTransactionMutation.mutate({
            destinationIdentifierType: values.identifierType,
            destinationIdentifier: values.identifier,
            balance: parseFloat(values.amount),
          });
          helpers.resetForm();
        }}
      >
        <Form className="flex w-full flex-col items-center gap-4">
          <div className="flex w-full items-center gap-4">
            <Field
              name="identifierType"
              as="select"
              className="block h-[3rem] rounded-lg bg-stone-900  px-4 py-2 text-pink-400 focus:outline-none "
            >
              <option value="phone">Phone</option>
              <option value="email">Email</option>
              <option selected value="name">
                Name
              </option>
              <option value="alias">Alias</option>
              <option value="cbu">Cbu</option>
            </Field>
            <Field
              name="identifier"
              placeholder="Enter an identifier"
              className="h-[3rem] w-full rounded-lg bg-stone-900
          px-4 py-2  text-stone-100  focus:outline-none"
            />
          </div>
          <Field
            name="amount"
            type="number"
            placeholder="Enter an amount"
            className="h-[3rem] w-full rounded-lg bg-stone-900 px-4 py-2 text-stone-100
          [appearance:textfield] focus:outline-none  [&::-webkit-inner-spin-button]:appearance-none  [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            type="submit"
            className="h-[3rem] w-full rounded-lg bg-pink-400
            px-4 py-2 font-bold text-stone-100  focus:outline-none"
          >
            Send
          </button>
        </Form>
      </Formik>
    </div>
  );
}

export default MakeTransaction;
