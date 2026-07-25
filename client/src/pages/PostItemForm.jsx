import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const PostItemForm = ({ type = "found" }) => {
  const isFound = type === "found";
  // for redirection when submitted
  const navigate = useNavigate();
  // form data container
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Other",
    location: "",
    date: "",
    ...(isFound && { claimQuestion: "" }), // Only include for found items
    tags: "",
  });

  // error container
  const [error, setError] = useState("");
  // flag to disable button when submitting
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [statusText, setStatusText] = useState("Post Found Item");

  const handleChange = (i) => {
    setFormData({ ...formData, [i.target.name]: i.target.value });
  };

  const handleSubmit = async (i) => {
    // prevents browser from reloading
    i.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      let photoUrl = "";
      if (imageFile) {
        setStatusText("Uploading image...");
        // temporary form object to call upload middleware
        const imgForm = new FormData();
        imgForm.append("image", imageFile);
        const uploadRes = await api.post("/upload", imgForm);
        photoUrl = uploadRes.data.url;
      }

      setStatusText("Posting item...");
      const payload = {
        ...formData,
        photoUrl,
        type,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim()) // remove whitespaces
          .filter(Boolean), // remove empty stuff
      };

      const { data } = await api.post("/items", payload);
      // go to item after posting
      navigate(`/item/${data.data._id}`);
    } catch (error) {
      // set error message
      setError(
        error.response?.data?.message || "Something went wrong. Try again.",
      );
    } finally {
      setSubmitting(false);
      setStatusText(isFound ? "Post Found Item" : "Post Lost Item");
    }
  };

  return (
    <div className="mx-10 my-4">
      <h1 className="flex justify-center text-4xl font-medium font-heading mb-3 text-text">
        {isFound ? "Report Something Found" : "Report Something Lost"}
      </h1>
      {/* render error if present*/}
      {error ? <p className="text-error text-center">{error}</p> : null}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="title"
          placeholder="Title (e.g. Blue Bottle)"
          value={formData.title}
          onChange={handleChange}
          required
          className="border border-overlay bg-surface text-text placeholder-subtext p-2 rounded-lg transition focus:outline-none focus:border-accent-600 focus:ring-1 focus:ring-accent-500"
        />

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={3}
          className="border border-overlay bg-surface text-text placeholder-subtext p-2 rounded-lg transition focus:outline-none focus:border-accent-600 focus:ring-1 focus:ring-accent-500"
        />

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="border border-overlay bg-surface text-text placeholder-subtext p-2 rounded-lg transition focus:outline-none focus:border-accent-600 focus:ring-1 focus:ring-accent-500"
        >
          <option value="" disabled>
            Select category
          </option>
          <option value="ID Card">ID Card</option>
          <option value="Bottle">Bottle</option>
          <option value="Electronics">Electronics</option>
          <option value="Book">Book</option>
          <option value="Bag">Bag</option>
          <option value="Other">Other</option>
        </select>

        <input
          type="text"
          name="location"
          placeholder={isFound ? "Location found" : "Location lost"}
          value={formData.location}
          onChange={handleChange}
          required
          className="border border-overlay bg-surface text-text placeholder-subtext p-2 rounded-lg transition focus:outline-none focus:border-accent-600 focus:ring-1 focus:ring-accent-500"
        />

        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          className="border border-overlay bg-surface text-text placeholder-subtext p-2 rounded-lg transition focus:outline-none focus:border-accent-600 focus:ring-1 focus:ring-accent-500"
        />

        {isFound && (
          <input
            type="text"
            name="claimQuestion"
            placeholder="Ask something about the item"
            value={formData.claimQuestion}
            onChange={handleChange}
            required
            className="border border-overlay bg-surface text-text placeholder-subtext p-2 rounded-lg transition focus:outline-none focus:border-accent-600 focus:ring-1 focus:ring-accent-500"
          />
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
          className="block w-full text-sm text-subtext cursor-pointer rounded-lg border border-overlay bg-surface shadow-xs transition focus:outline-none focus:border-accent-600 focus:ring-1 focus:ring-accent-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-l-lg file:border-0 file:bg-overlay file:text-text file:font-medium file:hover:bg-accent-500 file:hover:text-white"
        />

        <input
          type="text"
          name="tags"
          placeholder="Tags, comma separated (e.g. blue, plastic)"
          value={formData.tags}
          onChange={handleChange}
          className="border border-overlay bg-surface text-text placeholder-subtext p-2 rounded-lg transition focus:outline-none focus:border-accent-600 focus:ring-1 focus:ring-accent-500"
        />

        <button
          type="submit"
          disabled={submitting}
          className="bg-accent-500 text-white hover:bg-accent-600 p-2 rounded-lg disabled:opacity-50 self-center font-medium cursor-pointer transition"
        >
          {submitting
            ? statusText
            : isFound
              ? "Post Found Item"
              : "Post Lost Item"}
        </button>
      </form>
    </div>
  );
};

export default PostItemForm;
