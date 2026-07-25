const PageContainer = ({
  children,
  maxWidth = "max-w-6xl",
  className = "",
}) => {
  return (
    <div className={`${maxWidth} mx-auto px-4 sm:px-6 w-full ${className}`}>
      {children}
    </div>
  );
};

export default PageContainer;
