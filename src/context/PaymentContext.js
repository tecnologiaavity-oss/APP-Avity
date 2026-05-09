import React, { createContext, useContext, useState } from "react";

const PaymentContext = createContext();

export function PaymentProvider({ children }) {
  const [cartoes, setCartoes] = useState([]);

  const adicionarCartao = (cartao) => {
    setCartoes((prev) => [...prev, cartao]);
  };

  const removerCartao = (id) => {
    setCartoes((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <PaymentContext.Provider value={{ cartoes, adicionarCartao, removerCartao }}>
      {children}
    </PaymentContext.Provider>
  );
}

export const usePayment = () => useContext(PaymentContext);