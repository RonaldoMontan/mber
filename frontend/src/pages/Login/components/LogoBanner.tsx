import logo from '../../../assets/Logo.png';

export const LogoBanner = () => {
  return (
    <div className="hidden md:flex w-1/2 bg-[#B22222] items-center justify-center">
      <img
        src={logo}
        alt="Logo"
        className="w-2/3 object-contain drop-shadow-2xl"
      />
    </div>
  );
};
