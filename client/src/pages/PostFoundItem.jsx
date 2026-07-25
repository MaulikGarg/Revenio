import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const PostFoundItem = () => {
  // for redirection when submitted
  const navigate = useNavigate();
  // form data container
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Other",
    location: "",
    date: "",
    photoUrl: "",
    claimQuestion: "",
    tags: "",
  });

  // error container
  const [error, setError] = useState("");
  // flag to disable button when submitting
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (i) => {
    setFormData({ ...formData, [i.target.name]: i.target.value });
  };

  const handleSubmit = async (i) => {
    // prevents browser from reloading
    i.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        type: "found",
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
    }
  };

  return (
    <div className="mx-10 my-4">
      <h1 className="flex justify-center text-4xl font-medium font-heading mb-3 text-text">
        Report Something Found
      </h1>
      {/* render error if present*/}
      {error ? <p className="text-error text-center">{error}</p> : null}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="title"
          placeholder="Title (e.g. Found Blue Bottle)"
          value={formData.title}
          onChange={handleChange}
          required
          className="border border-overlay bg-surface text-text placeholder-subtext p-2 rounded"
        />

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          required
          className="border border-overlay bg-surface text-text placeholder-subtext p-2 rounded"
        />

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="border border-overlay bg-surface text-text placeholder-subtext p-2 rounded"
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
          placeholder="Location found"
          value={formData.location}
          onChange={handleChange}
          required
          className="border border-overlay bg-surface text-text placeholder-subtext p-2 rounded"
        />

        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          className="border border-overlay bg-surface text-text placeholder-subtext p-2 rounded"
        />

        <input
          type="text"
          name="claimQuestion"
          placeholder="Ask something about the item"
          value={formData.claimQuestion}
          onChange={handleChange}
          required
          className="border border-overlay bg-surface text-text placeholder-subtext p-2 rounded"
        />

        <input
          type="text"
          name="photoUrl"
          placeholder="Photo URL (optional)"
          value={formData.photoUrl}
          onChange={handleChange}
          className="border border-overlay bg-surface text-text placeholder-subtext p-2 rounded"
        />

        <input
          type="text"
          name="tags"
          placeholder="Tags, comma separated (e.g. blue, plastic)"
          value={formData.tags}
          onChange={handleChange}
          className="border border-overlay bg-surface text-text placeholder-subtext p-2 rounded"
        />

        <button
          type="submit"
          disabled={submitting}
          className="bg-accent-500 text-white hover:bg-accent-600 p-2 rounded disabled:opacity-50 self-center"
        >
          {submitting ? "Posting..." : "Post Found Item"}
        </button>
      </form>
    </div>
  );
};

export default PostFoundItem;
