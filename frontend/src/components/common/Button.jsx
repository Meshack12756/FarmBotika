const Button = ({ children, ...props }) => (
  <button className="px-4 py-2 bg-green-700 text-white rounded" {...props}>
    {children}
  </button>
);
export default Button;
