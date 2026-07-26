import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageContainer from "../components/PageContainer";
import api from "../api/axios";
import {
  Calendar,
  Tag,
  ImagePlus,
  Type,
  AlignLeft,
  Shapes,
  MapPin,
  HelpCircle,
} from "lucide-react";

const PostItemForm = ({ type = "found" }) => {
  const isFound = type === "found";
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Other",
    location: "",
    date: "",
    ...(isFound && { claimQuestion: "" }),
    tags: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [statusText, setStatusText] = useState("Post Found Item");
  const [confirmedCheck, setConfirmedCheck] = useState(false);

  const handleChange = (i) => {
    setFormData({ ...formData, [i.target.name]: i.target.value });
  };

  const handleCheckExisting = () => {
    const targetType = isFound ? "lost" : "found";
    const params = new URLSearchParams();
    if (formData.title) params.set("q", formData.title);
    if (formData.category && formData.category !== "Other")
      params.set("category", formData.category);

    window.open(`/dashboard/${targetType}?${params.toString()}`, "_blank");
  };

  const validate = () => {
    if (formData.title.trim().length < 3) {
      return "Title must be at least 3 characters.";
    }
    if (formData.description.trim().length < 10) {
      return "Description must be at least 10 characters.";
    }
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (selectedDate > today) {
      return "Date cannot be in the future.";
    }
    if (imageFile && imageFile.size > 5 * 1024 * 1024) {
      return "Image must be under 5MB.";
    }
    if (!confirmedCheck) {
      return "Please confirm you checked existing posts first.";
    }
    return null;
  };

  const handleSubmit = async (i) => {
    i.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      let photoUrl = "";
      if (imageFile) {
        setStatusText("Uploading image...");
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
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const { data } = await api.post("/items", payload);
      navigate(`/item/${data.data._id}`);
    } catch (error) {
      setError(
        error.response?.data?.message || "Something went wrong. Try again.",
      );
    } finally {
      setSubmitting(false);
      setStatusText(isFound ? "Post Found Item" : "Post Lost Item");
    }
  };

  return (
    <PageContainer maxWidth="max-w-lg" className="my-4">
      <h1 className="flex justify-center text-4xl font-medium font-heading mb-3 text-text">
        {isFound ? "Report Something Found" : "Report Something Lost"}
      </h1>
      {error ? <p className="text-error text-center">{error}</p> : null}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 max-w-lg mx-auto w-full"
      >
        <div>
          <label className="flex items-center gap-2 text-sm text-subtext mb-1">
            <Type size={16} />
            Title
          </label>
          <input
            type="text"
            name="title"
            placeholder="e.g. Blue Bottle"
            value={formData.title}
            onChange={handleChange}
            required
            autocomplete="off"
            className="border border-overlay bg-surface text-text placeholder-subtext p-2 rounded-lg w-full transition focus:outline-none focus:border-accent-600 focus:ring-1 focus:ring-accent-500"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm text-subtext mb-1">
            <AlignLeft size={16} />
            Description
          </label>
          <textarea
            name="description"
            placeholder="Describe the item..."
            value={formData.description}
            onChange={handleChange}
            required
            autocomplete="off"
            rows={3}
            className="border border-overlay bg-surface text-text placeholder-subtext p-2 rounded-lg w-full transition focus:outline-none focus:border-accent-600 focus:ring-1 focus:ring-accent-500"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm text-subtext mb-1">
            <Shapes size={16} />
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="border border-overlay bg-surface text-text p-2 rounded-lg w-full transition focus:outline-none focus:border-accent-600 focus:ring-1 focus:ring-accent-500"
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
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm text-subtext mb-1">
            <MapPin size={16} />
            Location
          </label>
          <input
            type="text"
            name="location"
            placeholder={
              isFound ? "Where did you find it?" : "Where did you lose it?"
            }
            value={formData.location}
            onChange={handleChange}
            required
            autocomplete="off"
            className="border border-overlay bg-surface text-text placeholder-subtext p-2 rounded-lg w-full transition focus:outline-none focus:border-accent-600 focus:ring-1 focus:ring-accent-500"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm text-subtext mb-1">
            <Calendar size={16} />
            Date
          </label>
          <div className="relative">
            <input
              type="date"
              name="date"
              value={formData.date}
              max={new Date().toISOString().split("T")[0]}
              onChange={handleChange}
              required
              className="border border-overlay bg-surface text-text p-2 pr-10 rounded-lg w-full transition focus:outline-none focus:border-accent-600 focus:ring-1 focus:ring-accent-500"
            />
            <Calendar
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-subtext pointer-events-none"
            />
          </div>
        </div>

        {isFound && (
          <div>
            <label className="flex items-center gap-2 text-sm text-subtext mb-1">
              <HelpCircle size={16} />
              Claim Question
            </label>
            <input
              type="text"
              name="claimQuestion"
              placeholder="Ask something only the owner would know"
              value={formData.claimQuestion}
              onChange={handleChange}
              required
              autocomplete="off"
              className="border border-overlay bg-surface text-text placeholder-subtext p-2 rounded-lg w-full transition focus:outline-none focus:border-accent-600 focus:ring-1 focus:ring-accent-500"
            />
          </div>
        )}

        <div>
          <label className="flex items-center gap-2 text-sm text-subtext mb-1">
            <ImagePlus size={16} />
            Photo (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="block w-full text-sm text-subtext cursor-pointer rounded-lg border border-overlay bg-surface shadow-xs transition focus:outline-none focus:border-accent-600 focus:ring-1 focus:ring-accent-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-l-lg file:border-0 file:bg-overlay file:text-text file:font-medium file:hover:bg-accent-500 file:hover:text-white"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm text-subtext mb-1">
            <Tag size={16} />
            Tags
          </label>
          <input
            type="text"
            name="tags"
            placeholder="comma separated, e.g. blue, plastic"
            value={formData.tags}
            onChange={handleChange}
            autocomplete="off"
            className="border border-overlay bg-surface text-text placeholder-subtext p-2 rounded-lg w-full transition focus:outline-none focus:border-accent-600 focus:ring-1 focus:ring-accent-500"
          />
        </div>
        <div className="flex items-center gap-2 border border-overlay rounded-lg p-3">
          <input
            type="checkbox"
            id="confirmCheck"
            checked={confirmedCheck}
            onChange={(e) => setConfirmedCheck(e.target.checked)}
            className="w-4 h-4 accent-accent-500 cursor-pointer"
          />
          <label
            htmlFor="confirmCheck"
            className="text-sm text-text flex-1 cursor-pointer"
          >
            I checked the {isFound ? "lost" : "found"} items page and didn't
            find a matching post.
          </label>
          <button
            type="button"
            onClick={handleCheckExisting}
            className="text-xs text-accent-500 hover:underline whitespace-nowrap cursor-pointer underline"
          >
            Check now
          </button>
        </div>
        <button
          type="submit"
          disabled={submitting || !confirmedCheck}
          className="bg-accent-500 text-white hover:bg-accent-600 p-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed self-center font-medium cursor-pointer transition"
        >
          {submitting
            ? statusText
            : isFound
              ? "Post Found Item"
              : "Post Lost Item"}
        </button>
      </form>
    </PageContainer>
  );
};

export default PostItemForm;
