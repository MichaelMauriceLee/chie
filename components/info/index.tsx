import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";

export default async function Info() {
  const t = await getTranslations("Info");

  return (
    <Card className="mt-6">
      <CardHeader>
        <h3 className="text-3xl font-bold">{t("welcome.title")}</h3>
      </CardHeader>
      <CardContent className="space-y-6 text-gray-800 dark:text-gray-200">
        <div>
          <p>
            {t.rich("welcome.description", {
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </p>
        </div>

        <h3 className="text-2xl font-bold">{t("features.title")}</h3>
        <div>
          <ul className="list-disc list-inside space-y-2">
            <li>
              {t.rich("features.translation", {
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </li>
            <li>
              {t.rich("features.wordAnalysis", {
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </li>
            <li>
              {t.rich("features.ankiIntegration", {
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </li>
            <li>
              {t.rich("features.imageAudioSupport", {
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </li>
          </ul>
        </div>

        <h3 className="text-2xl font-bold">{t("gettingStarted.title")}</h3>
        <div>
          <p>{t("gettingStarted.description")}</p>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              {t("gettingStarted.stepOne")}{" "}
              <a
                href="https://foosoft.net/projects/anki-connect/"
                className="text-blue-500 dark:text-blue-400 underline"
              >
                {t("gettingStarted.ankiConnectLink")}
              </a>
            </li>
            <li>{t("gettingStarted.stepTwo")}</li>
          </ol>
          <div className="rounded p-4 bg-gray-100 dark:bg-gray-800 text-sm font-mono">
            <div>&#123;</div>
            <div>&emsp;&quot;apiKey&quot;: null,</div>
            <div>&emsp;&quot;apiLogPath&quot;: null,</div>
            <div>&emsp;&quot;ignoreOriginList&quot;: [],</div>
            <div>&emsp;&quot;webBindAddress&quot;: &quot;127.0.0.1&quot;,</div>
            <div>&emsp;&quot;webBindPort&quot;: 8765,</div>
            <div>&emsp;&quot;webCorsOriginList&quot;: [</div>
            <div>&emsp;&emsp;&quot;http://localhost&quot;,</div>
            <div>&emsp;&emsp;&quot;http://localhost:3000&quot;,</div>
            <div>&emsp;&emsp;&quot;https://chie.vercel.app&quot;</div>
            <div>&emsp;]</div>
            <div>&#125;</div>
          </div>
          <p>{t("gettingStarted.stepThree")}</p>
        </div>
      </CardContent>
    </Card>
  );
}
