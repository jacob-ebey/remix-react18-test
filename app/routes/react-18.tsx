import { lazy, Suspense } from "react";
import { useSearchParams, useSubmit } from "remix";

import { useLoader } from "~/dataloader/lib";
import type { Post } from "~/routes/api/posts";

let AppStore = lazy(() => import("~/components/app-store"));
let PlayStore = lazy(() => import("~/components/play-store"));

function SuspendedProfileInfo({ getPosts }: { getPosts: () => Post[] }) {
  let posts = getPosts();

  return (
    <pre>
      <code>{JSON.stringify(posts, null, 2)}</code>
    </pre>
  );
}

export default function React18Features() {
  let [searchParams] = useSearchParams();
  let submit = useSubmit();

  let postsLoader = useLoader<Post[]>("routes/api/posts");

  let lazyComponent = searchParams.get("lazy");

  return (
    <div className="h-96 w-screen bg-white">
      <header className="mx-auto mb-4 flex max-w-2xl flex-wrap px-4 py-4">
        <a
          href="https://www.ebey.me"
          className="inline-flex items-center p-2 hover:bg-yellow-100"
        >
          <svg className="mr-3 inline-block h-5 w-5 bg-black">
            <path d="M0 0h19v19H0z" />
          </svg>
          <span className="text-lg font-semibold">React 18</span>
        </a>
      </header>

      <Suspense fallback="">
        <div className="mx-auto my-16 max-w-2xl px-6">
          <section>
            <h1 className="mt-16 text-6xl font-bold">Lazy Components</h1>
            <p className="description mt-16 w-full text-gray-500 md:w-2/3">
              Sometimes you need to dynamically load a component at runtime.
              With React 18, you can now use{" "}
              <code className="bg-gray-500 text-white">lazy()</code> on the
              server!
            </p>

            <div className="relative mt-8 block w-full text-gray-700">
              <select
                className="focus:shadow-outline h-10 w-full appearance-none rounded-lg border pl-3 pr-6 text-base placeholder-gray-600"
                placeholder="Regular input"
                defaultValue={lazyComponent || ""}
                onChange={(event) => {
                  submit({ lazy: event.target.value });
                }}
              >
                <option disabled value="">
                  Select a component
                </option>
                <option value="app-store">App Store Component</option>
                <option value="play-store">Play Store Component</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                    fillRule="evenodd"
                  ></path>
                </svg>
              </div>
            </div>

            {(() => {
              switch (lazyComponent) {
                case "app-store":
                  return <AppStore />;
                case "play-store":
                  return <PlayStore />;
                default:
                  return null;
              }
            })()}
          </section>
        </div>
      </Suspense>

      <Suspense fallback="Loading Profile....">
        <SuspendedProfileInfo getPosts={postsLoader.load} />
        <postsLoader.Component />
      </Suspense>
    </div>
  );
}
