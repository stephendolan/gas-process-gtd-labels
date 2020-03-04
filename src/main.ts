class SimpleMessage {
  subject: string;
  url: string;
  body: string;

  constructor(subject: string, id: string, body: string) {
    this.subject = subject;
    this.url = this.linkFromId(id);
    this.body = body;
  }

  private linkFromId(id: string): string {
    const baseUrl = "https://mail.google.com/mail/u/0/#all";

    return `${baseUrl}/${id}`;
  }
}

class TaskEmail {
  message: SimpleMessage;
  prefix: string;

  constructor(message: SimpleMessage, prefix: string) {
    this.message = message;
    this.prefix = prefix;
  }

  public send(): boolean {
    const recipient = this.getRecipient();

    if (recipient === null) return false;

    MailApp.sendEmail(recipient, this.getSubject(), this.getBody());

    return true;
  }

  private getSubject(): string {
    const title = `-- ${this.prefix} : ${this.message.subject}`;
    const dueDate = `# tomorrow`;

    return `${title} ${dueDate}`;
  }

  private getBody(): string {
    return `${this.message.url}\n\n${this.message.body}`;
  }

  private getRecipient(): string | null {
    return PropertiesService.getUserProperties().getProperty("TO_EMAIL");
  }
}

function defineUserProperties() {
  const userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty("TO_EMAIL", "your-task-email@task-manager.com");
}

function main() {
  defineUserProperties();
  const labelsToProcess = ["@action", "@waiting"];

  labelsToProcess.forEach(labelText => {
    const label = GmailApp.getUserLabelByName(labelText);

    label.getThreads().forEach(thread => {
      const latestMessage = thread.getMessages().pop();

      if (latestMessage === undefined) return;

      const subject = latestMessage.getSubject();
      const messageId = thread.getId();
      const body = latestMessage.getPlainBody();

      const message = new SimpleMessage(subject, messageId, body);

      if (new TaskEmail(message, labelText).send()) {
        thread.removeLabel(label);
      }
    });
  });
}
