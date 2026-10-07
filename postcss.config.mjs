import autoprefixer from "autoprefixer";
import postcss from "postcss";
import tailwindcss from "tailwindcss";

const tailwindProcessor = postcss([tailwindcss()]);
const projectTailwind = {
  postcssPlugin: "project-tailwindcss",
  async Once(root, { result }) {
    if (
      result.opts.from?.includes(
        "/node_modules/@emdash-cms/admin/dist/styles.css"
      )
    ) {
      return;
    }

    await tailwindProcessor.process(root, { from: result.opts.from });
  },
};

export default {
  plugins: [projectTailwind, autoprefixer()],
};
