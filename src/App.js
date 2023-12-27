import { LuArrowDownUp } from "react-icons/lu";
import { FaReact } from "react-icons/fa";
import { useEffect, useState } from "react";

export default function App() {
  const [amount, setAmount] = useState(1);
  const [fromCur, setFromCur] = useState("INR");
  const [toCur, setToCur] = useState("USD");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState("");
  const [rate, setRate] = useState(null);

  function handleCurrencySwap() {
    setFromCur(toCur);
    setToCur(fromCur);
  }

  // build the loading and the error component

  function handleAmount(e) {
    if (!Number.isFinite(+e.target.value)) return;
    setAmount(+e.target.value);
  }

  useEffect(
    function () {
      const abortController = new AbortController();
      const signal = abortController.signal;
      async function getRates() {
        try {
          setIsLoading(true);
          setErrors("");

          const res = await fetch(
            `https://api.frankfurter.app/latest?amount=${amount}&from=${fromCur}&to=${toCur}`,
            { signal }
          );

          console.log(res);

          if (!res.ok) throw new Error("errors now");

          const data = await res.json();
          console.log(data);
          setRate(data);
        } catch (err) {
          console.error(err.message);
          if (err.message !== "The user aborted a request." || !err.message) {
            setErrors(
              "Sorry, couldn't find the Currency you were looking to convert"
            );
          }
        } finally {
          setIsLoading(false);
        }
      }

      if (fromCur === toCur) return setRate(amount);
      if (amount === 0) return;
      getRates();

      return () => {
        abortController.abort();
      };
    },
    [fromCur, toCur, amount]
  );

  return (
    <div className="min-h-screen overflow-auto flex  flex-col justify-center items-center gap-8  bg-gray-950">
      <p className="text-white text-4xl">Currency Converter</p>
      <div className="bg-gray-900 shadow-lg shadow-slate-950 max-w-[400px] rounded-md w-full px-6 pb-6 pt-12">
        <Form
          amount={amount}
          onAmount={handleAmount}
          isLoading={isLoading}
          onCurrencySwap={handleCurrencySwap}
          fromCur={fromCur}
          onFromCur={(e) => setFromCur(e.target.value)}
          toCur={toCur}
          onToCur={(e) => setToCur(e.target.value)}
        />

        {isLoading && <Loading />}
        {errors && <Error errMessage={errors} />}
        {!isLoading && !errors && <ConversionResult rate={rate} />}
        <MadeWith />
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="lds-ellipsis">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
}

function Error({ errMessage = "Country not found" }) {
  return (
    <div className="mt-6 text-white italic font-medium">😕 {errMessage}</div>
  );
}

function Form({
  amount,
  onAmount,
  fromCur,
  onFromCur,
  toCur,
  onToCur,
  isLoading,
  onCurrencySwap,
}) {
  return (
    <form action="" className="space-y-3.5">
      <div className="space-y-4">
        <input
          type="text"
          value={amount}
          onChange={onAmount}
          className="bg-inherit border border-gray-600 focus:border-blue-500 text-white py-2 px-4 w-full rounded-md focus:outline-none"
        />
        <CountrySelectOptions
          value={fromCur}
          disable={isLoading}
          onChange={onFromCur}
        />
      </div>
      <div
        onClick={onCurrencySwap}
        className="flex justify-center cursor-pointer  w-fit mx-auto hover:bg-gray-700 transition-colors py-2 px-3 rounded-md"
      >
        <LuArrowDownUp color="white" cursor="pointer" fontSize="19px" />
      </div>
      <CountrySelectOptions
        value={toCur}
        disable={isLoading}
        onChange={onToCur}
      />
    </form>
  );
}

function CountrySelectOptions({ value, onChange, disable }) {
  const [countries, setCountries] = useState([]);

  useEffect(function () {
    async function getAllCountries() {
      try {
        const res = await fetch("https://restcountries.com/v3.1/all");

        if (!res.ok) throw new Error("Something went wrong");

        const data = await res.json();

        setCountries(data);
      } catch (err) {
        console.error(err.message);
      }
    }

    getAllCountries();
  }, []);

  const countriesWithCurrencies = countries.filter(
    (country) => country.currencies
  );

  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disable}
      className="w-full border border-gray-600 focus:border-blue-500 cursor-pointer bg-inherit rounded-md focus:outline-none py-2 px-4"
    >
      {countriesWithCurrencies.map((country) => (
        <option
          value={Object.keys(country.currencies)[0]}
          key={crypto.randomUUID()}
        >
          {Object.keys(country.currencies)[0]} (
          {country.currencies[Object.keys(country.currencies)[0]]?.name})
        </option>
      ))}
    </select>
  );
}

function ConversionResult({ rate }) {
  return (
    <div>
      <p className="text-white mt-6 font-medium text-sm">
        {rate?.amount} {rate?.base} ={" "}
      </p>
      <p className="text-white font-medium text-3xl mt-3">
        {rate?.rates[Object.keys(rate?.rates)[0]]}{" "}
        {rate && Object.keys(rate?.rates)[0]}
      </p>
      <p className="text-gray-400 italic text-sm mt-3">
        Last updated on {rate?.date}
      </p>
    </div>
  );
}

function MadeWith() {
  return (
    <div className="text-white font-medium  w-fit mx-auto mt-12 flex items-center gap-2">
      Made with <FaReact className="font-bold text-white " fontSize="22px" />
    </div>
  );
}
