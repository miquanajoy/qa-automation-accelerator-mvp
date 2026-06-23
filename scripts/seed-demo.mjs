import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const project = await prisma.project.upsert({
    where: {
      id: "demo-project"
    },
    create: {
      id: "demo-project",
      name: "Demo QA Project",
      description: "Demo project for MVP database schema validation",
      pages: {
        create: {
          id: "demo-page-home",
          url: "https://example.com",
          title: "Example Domain",
          html: "<html><body><h1>Example Domain</h1><button id=\"start-button\">Start</button></body></html>",
          elements: {
            create: [
              {
                id: "demo-element-heading",
                tagName: "h1",
                text: "Example Domain",
                xpath: "/html/body/h1",
                cssSelector: "body > h1",
                locators: {
                  create: {
                    locatorType: "text",
                    locatorValue: "Example Domain",
                    score: 78,
                    recommendation: "Useful for static text verification",
                    reason: "Readable, but text can change with content updates"
                  }
                }
              },
              {
                id: "demo-element-start-button",
                tagName: "button",
                elementId: "start-button",
                text: "Start",
                role: "button",
                name: "Start",
                xpath: "//*[@id='start-button']",
                cssSelector: "#start-button",
                locators: {
                  create: {
                    locatorType: "role",
                    locatorValue: "page.getByRole('button', { name: 'Start' })",
                    score: 94,
                    recommendation: "Prefer this locator",
                    reason: "Role and accessible name are stable and readable"
                  }
                }
              }
            ]
          },
          snapshots: {
            create: {
              snapshotData: {
                url: "https://example.com",
                title: "Example Domain",
                capturedElementCount: 2
              }
            }
          },
          generatedFiles: {
            create: {
              type: "page_object",
              content:
                "import { Page } from '@playwright/test';\n\nexport class ExamplePage {\n  constructor(private readonly page: Page) {}\n\n  startButton() {\n    return this.page.getByRole('button', { name: 'Start' });\n  }\n}\n"
            }
          }
        }
      }
    },
    update: {
      name: "Demo QA Project",
      description: "Demo project for MVP database schema validation"
    }
  });

  console.log("Demo project is ready:");
  console.log(`projectId: ${project.id}`);
  console.log(`name: ${project.name}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
