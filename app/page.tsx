import Form from "./components/Form";

export default function Home() {
  return (
    <main className='flex flex-col justify-center items-center m-0 bg-radial from-slate-500 to-slate-800 text-slate-800 text-2xl h-dvh box-border'>
      <h1 className="text-sky-50 uppercase">Cotizador online</h1>
     <Form />
     
    </main>
  );
}
