import PageContainer from "./PageContainer";

const Footer = () => {
  return (
    <footer className="border-t border-overlay bg-surface px-6 py-4 mt-auto">
      <PageContainer
        maxWidth="max-w-5xl"
        className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-subtext"
      >
        <p>© {new Date().getFullYear()} Revenio.</p>
        <p>Made by maulik</p>
      </PageContainer>
    </footer>
  );
};

export default Footer;
