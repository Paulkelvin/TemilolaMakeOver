import { defineType, defineField } from "sanity";

export const trainingCourseSchema = defineType({
  name: "trainingCourse",
  title: "Training Course",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Course Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
    }),
    defineField({
      name: "level",
      title: "Level",
      type: "string",
      options: {
        list: [
          { title: "Beginner", value: "Beginner" },
          { title: "Advanced", value: "Advanced" },
          { title: "Bridal Specialty", value: "Bridal Specialty" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "duration",
      title: "Duration",
      type: "string",
    }),
    defineField({
      name: "price",
      title: "Price (NGN)",
      type: "number",
    }),
    defineField({
      name: "classSize",
      title: "Max Class Size",
      type: "number",
    }),
    defineField({
      name: "certification",
      title: "Includes Certification",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "curriculum",
      title: "Curriculum Items",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "highlights",
      title: "Highlights",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "image",
      title: "Course Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: "Display Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", level: "level" },
    prepare({ title, level }) {
      return { title, subtitle: level };
    },
  },
});
