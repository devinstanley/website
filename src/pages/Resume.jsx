import resume from '../resources/Devin_Resume.pdf';

const Resume = () => {
  return (
    <div style={{ width: "100%", height: "90vh"}}>
      <object
        data={resume}
        type="application/pdf"
        width="100%"
        height="100%"
      >
        <p>
          Your browser does not support PDFs. You can{" "}
          <a href="/resume.pdf" target="_blank" rel="noopener noreferrer">
            download it here
          </a>
          .
        </p>
      </object>
    </div>
  );
};

export default Resume;