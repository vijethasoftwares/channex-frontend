import Container from "@/components/container";
import ContainerBetween from "@/components/container-between";
import ContainerColumn from "@/components/container-column";
import Heading from "@/components/heading";

const Pricing = () => {
  return (
    <Container>
      <ContainerColumn>
        <div>
          <Heading className="text-black">Flexi Pricing</Heading>
          <ContainerBetween>
            <p className="text-black text-sm">
              Choose the perfect plan for your business
            </p>
            <div className="p-1.5 bg-white rounded-3xl border">
              <button className="text-white bg-indigo-600 px-4 p-2 rounded-3xl text-sm">
                Yearly
              </button>
              <button className="px-4 text-black p-2 rounded-3xl text-sm">
                Monthly
              </button>
            </div>
          </ContainerBetween>
        </div>
        <div className="w-full grid grid-cols-3 gap-5">
          <div className="p-5 border rounded-xl flex flex-col gap-5 shadow-sm">
            <h3 className="text-black font-semibold text-lg">Hostel Package</h3>
            <h1 className="text-black font-bold text-3xl">
              ₹2,000{" "}
              <span className="text-sm font-normal text-black">
                /property/month
              </span>
            </h1>
            <button className="text-white bg-indigo-600 px-4 p-4 rounded-xl text-sm">
              Get Started
            </button>
          </div>
          <div className="p-5 border rounded-xl flex flex-col gap-5 shadow-sm">
            <h3 className="text-black font-semibold text-lg">Hotel Package</h3>
            <h1 className="text-black font-bold text-3xl">
              ₹2,500{" "}
              <span className="text-sm font-normal text-black">
                /property/month
              </span>
            </h1>
            <button className="text-white bg-indigo-600 px-4 p-4 rounded-xl text-sm">
              Get Started
            </button>
          </div>
          <div className="p-5 border rounded-xl flex flex-col gap-5 shadow-sm">
            <h3 className="text-black font-semibold text-lg">
              Apartment Package
            </h3>
            <h1 className="text-black font-bold text-3xl">
              ₹3,000{" "}
              <span className="text-sm font-normal text-black">
                /property/month
              </span>
            </h1>
            <button className="text-white bg-indigo-600 px-4 p-4 rounded-xl text-sm">
              Get Started
            </button>
          </div>
        </div>
      </ContainerColumn>
      <ContainerColumn>
        <div className="mt-10">
          <Heading className="text-black">Bundle Pricing</Heading>
          <ContainerBetween>
            <p className="text-black text-sm">
              Choose the perfect plan for your business
            </p>
            <div className="p-1.5 bg-white rounded-3xl border">
              <button className="text-white bg-indigo-600 px-4 p-2 rounded-3xl text-sm">
                Yearly
              </button>
              <button className="px-4 text-black p-2 rounded-3xl text-sm">
                Monthly
              </button>
            </div>
          </ContainerBetween>
        </div>
        <div className="w-full grid grid-cols-3 gap-5">
          <div className="p-5 border rounded-xl flex flex-col gap-5 shadow-sm">
            <h3 className="text-black font-semibold text-lg">Hostel Package</h3>
            <h1 className="text-black font-bold text-3xl">
              ₹5,000{" "}
              <span className="text-sm font-normal text-black">
                /3-property/month
              </span>
            </h1>
            <button className="text-white bg-indigo-600 px-4 p-4 rounded-xl text-sm">
              Get Started
            </button>
          </div>
          <div className="p-5 border rounded-xl flex flex-col gap-5 shadow-sm">
            <h3 className="text-black font-semibold text-lg">Hotel Package</h3>
            <h1 className="text-black font-bold text-3xl">
              ₹6,000{" "}
              <span className="text-sm font-normal text-black">
                /3-property/month
              </span>
            </h1>
            <button className="text-white bg-indigo-600 px-4 p-4 rounded-xl text-sm">
              Get Started
            </button>
          </div>
          <div className="p-5 border rounded-xl flex flex-col gap-5 shadow-sm">
            <h3 className="text-black font-semibold text-lg">
              Apartment Package
            </h3>
            <h1 className="text-black font-bold text-3xl">
              ₹7,000{" "}
              <span className="text-sm font-normal text-black">
                /3-property/month
              </span>
            </h1>
            <button className="text-white bg-indigo-600 px-4 p-4 rounded-xl text-sm">
              Get Started
            </button>
          </div>
        </div>
      </ContainerColumn>
    </Container>
  );
};

export default Pricing;
