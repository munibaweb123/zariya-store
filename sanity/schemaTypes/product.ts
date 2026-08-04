import { defineField, defineType } from "sanity";

// Category is a fixed list, not a referenced taxonomy — these four slugs are
// the contract with infra/01's nav hrefs and frontend/02's /category/[slug] routes.
const CATEGORIES = [
  { title: "Dresses", value: "dresses" },
  { title: "Perfumes", value: "perfumes" },
  { title: "Beauty", value: "beauty" },
  { title: "Jewellery", value: "jewellery" },
] as const;

export const product = defineType({
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "price",
      title: "Price (Rs.)",
      type: "number",
      validation: (Rule) => Rule.required().integer().positive(),
    }),
    defineField({
      name: "salePrice",
      title: "Sale price (Rs.)",
      type: "number",
      validation: (Rule) => Rule.integer().positive(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [...CATEGORIES],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),
    defineField({
      name: "inStock",
      title: "In stock",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "category", media: "images.0" },
  },
});
