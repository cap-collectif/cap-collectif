<?php

namespace Capco\AppBundle\Mailer\Message;

abstract class Message
{
    protected $subject;
    protected $subjectVars;

    protected $template;
    protected $templateVars;

    protected $recipients;
    protected $replyTo;
    protected $senderEmail;
    protected $senderName;
    protected $cc;

    final public function __construct(
        string $recipientEmail,
        string $recipientName = null,
        string $subject,
        array $subjectVars,
        string $template, // twig or trad key
        array $templateVars,
        string $senderEmail,
        string $senderName = null,
        string $replyTo = null
    ) {
        $this->subject = $subject;
        $this->subjectVars = $subjectVars;
        $this->template = $template;
        $this->templateVars = $templateVars;

        $this->replyTo = $replyTo;
        $this->cc = [];
        $this->recipients = [];

<<<<<<< HEAD
        $this->senderEmail = $senderEmail;
        $this->senderName = $senderName;

=======
<<<<<<< HEAD
>>>>>>> Add structure for emailing
        $this->addRecipient($recipientEmail, $recipientName, []);
    }

    abstract public function getFooterTemplate();

    //:?string;

    abstract public function getFooterVars();

    //:?array;

    final public function getTemplateVars(): array
    {
        return $this->templateVars;
    }

    final public function getSubjectVars(): array
    {
        return $this->subjectVars;
=======
        $this->addRecipient($recipientEmail, $recipientName, $recipientVars);
    }

    final public function getVars(): array
    {
        return $this->vars;
>>>>>>> Add structure for emailing
    }

    final public function getSubject(): string
    {
        return $this->subject;
    }

    final public function getTemplate(): string
    {
        return $this->template;
    }

    public function getReplyTo()//: ?string
    {
        return $this->replyTo;
    }

    final public function addRecipient(string $recipientEmail, string $recipientName = null, array $vars = [])//: void
    {
        $key = mb_strtolower($recipientEmail);
>>>>>>> Add structure for emailing

        $this->recipients[$key] = new MessageRecipient($recipientEmail, $recipientName, $vars);
    }

    final public function getRecipients(): array
    {
        return array_values($this->recipients);
    }

    final public function getRecipient($key) //:?MessageRecipient
    {
        if (!is_int($key) && !is_string($key)) {
            throw new \InvalidArgumentException('Recipient key must be an integer index or valid email address string.');
        }

        if (is_string($key) && array_key_exists($key = mb_strtolower($key), $this->recipients)) {
            return $this->recipients[$key];
        }

        $recipients = $this->getRecipients();

        return $recipients[$key] ?? null;
    }

    public function getSenderEmail()//: ?string
    {
        return $this->senderEmail;
    }

    public function setSenderEmail(/*?string*/ $senderEmail): self
    {
        $this->senderEmail = $senderEmail;

        return $this;
    }

    public function getSenderName()//: ?string
    {
        return $this->senderName;
    }

    public function setSenderName(/*?string*/ $senderName): self
    {
        $this->senderName = $senderName;

        return $this;
    }

    public function getCC(): array
    {
        return $this->cc;
    }

    public function addCC(string $cc)//: void
    {
        $this->cc[] = $cc;
    }

    public function setReplyTo(string $replyTo): self
    {
        $this->replyTo = $replyTo;

        return $this;
    }

    final protected static function escape(string $string): string
    {
        return htmlspecialchars($string, ENT_QUOTES, 'UTF-8', false);
    }
}
