<?php
namespace Capco\AppBundle\Mailer\Mailjet\MessageFormat;

use \Swift_Attachment;
use \Swift_MimePart;

/**
 * https://github.com/mailjet/MailjetSwiftMailer
 */
class MessagePayloadV31 extends BaseMessagePayload
{
    private $version = 'v3.1';

    public function getMailjetMessage(\Swift_Mime_SimpleMessage $message): array
    {
        $contentType = self::getMessagePrimaryContentType($message);
        $fromAddresses = $message->getFrom();
        $fromEmails = array_keys($fromAddresses);
        $toAddresses = $message->getTo();
        $ccAddresses = $message->getCc() ?: [];
        $bccAddresses = $message->getBcc() ?: [];

        $attachments = [];
        $inline_attachments = [];

        // Process Headers
        $customHeaders = self::prepareHeaders($message, self::getMailjetHeaders());
        $userDefinedHeaders = self::findUserDefinedHeaders($message);

        // @TODO only Format To, Cc, Bcc
        $to = [];
        foreach ($toAddresses as $toEmail => $toName) {
            if ($toName !== null) {
                $to[] = ['Email' => $toEmail, 'Name' => $toName];
            } else {
                $to[] = ['Email' => $toEmail];
            }
        }
        $cc = [];
        foreach ($ccAddresses as $ccEmail => $ccName) {
            if ($ccName !== null) {
                $cc[] = ['Email' => $ccEmail, 'Name' => $ccName];
            } else {
                $cc[] = ['Email' => $ccEmail];
            }
        }
        $bcc = [];
        foreach ($bccAddresses as $bccEmail => $bccName) {
            if ($bccName !== null) {
                $bcc[] = ['Email' => $bccEmail, 'Name' => $bccName];
            } else {
                $bcc[] = ['Email' => $bccEmail];
            }
        }

        // Handle content
        $bodyHtml = $bodyText = null;
        if ($contentType === 'text/plain') {
            $bodyText = $message->getBody();
        } else {
            $bodyHtml = $message->getBody();
        }

        // Handle attachments
        foreach ($message->getChildren() as $child) {
            if ($child instanceof Swift_Attachment) {
                //Handle regular attachments
                if ($child->getDisposition() === 'attachment') {
                    $attachments[] = [
                        'ContentType' => $child->getContentType(),
                        'Filename' => $child->getFilename(),
                        'Base64Content' => base64_encode($child->getBody()),
                    ];
                } elseif ($child->getDisposition() === 'inline') {
                    //Handle inline attachments
                    $inline_attachments[] = [
                        'ContentType' => $child->getContentType(),
                        'Filename' => $child->getFilename(),
                        'ContentID' => $child->getId(),
                        'Base64Content' => base64_encode($child->getBody()),
                    ];
                }
            } elseif (
                $child instanceof Swift_MimePart &&
                self::supportsContentType($child->getContentType())
            ) {
                if ($child->getContentType() === 'text/html') {
                    $bodyHtml = $child->getBody();
                } elseif ($child->getContentType() === 'text/plain') {
                    $bodyText = $child->getBody();
                }
            }
        }
        $mailjetMessage = [];
        $from = ['Email' => $fromEmails[0], 'Name' => $fromAddresses[$fromEmails[0]]];

        if (!empty($from)) {
            if ($from['Name'] === null) {
                unset($from['Name']);
            }
            $mailjetMessage['From'] = $from;
        }
        if (!empty($to)) {
            $mailjetMessage['To'] = $to;
        }
        if (!empty($cc)) {
            $mailjetMessage['Cc'] = $cc;
        }
        if (!empty($bcc)) {
            $mailjetMessage['Bcc'] = $bcc;
        }
        if ($message->getSubject() !== null) {
            $mailjetMessage['Subject'] = $message->getSubject();
        }
        if ($bodyHtml !== null) {
            $mailjetMessage['HTMLPart'] = $bodyHtml;
        }
        if ($bodyText !== null) {
            $mailjetMessage['TextPart'] = $bodyText;
        }
        if ($replyTo = $this->getReplyTo($message)) {
            $mailjetMessage['ReplyTo'] = $replyTo;
        }

        if (\count($userDefinedHeaders) > 0) {
            $mailjetMessage['Headers'] = $userDefinedHeaders;
        }

        if (\count($customHeaders) > 0) {
            $mailjetMessage = array_merge($mailjetMessage, $customHeaders);
        }

        if (\count($attachments) > 0) {
            $mailjetMessage['Attachments'] = $attachments;
        }
        if (\count($inline_attachments) > 0) {
            $mailjetMessage['InlinedAttachments'] = $inline_attachments;
        }

        return ['Messages' => [$mailjetMessage]];
    }

    private static function getMailjetHeaders(): array
    {
        return [
            'X-MJ-TemplateID' => 'TemplateID',
            'X-MJ-TemplateLanguage' => 'TemplateLanguage',
            'X-MJ-TemplateErrorReporting' => 'TemplateErrorReporting',
            'X-MJ-TemplateErrorDeliver' => 'TemplateErrorDeliver',
            'X-Mailjet-Prio' => 'Priority',
            'X-Mailjet-Campaign' => 'CustomCampaign',
            'X-Mailjet-DeduplicateCampaign' => 'DeduplicateCampaign',
            'X-Mailjet-TrackOpen' => 'TrackOpens',
            'X-Mailjet-TrackClick' => 'TrackClicks',
            'X-MJ-CustomID' => 'CustomID',
            'X-MJ-EventPayLoad' => 'EventPayload',
            'X-MJ-MonitoringCategory' => 'MonitoringCategory',
            'X-MJ-Vars' => 'Variables',
        ];
    }

    private function getReplyTo(\Swift_Mime_SimpleMessage $message): ?array
    {
        if (\is_array($message->getReplyTo())) {
            return [
                'Email' => key($message->getReplyTo()),
                'Name' => current($message->getReplyTo()),
            ];
        }

        if (\is_string($message->getReplyTo())) {
            return ['Email' => $message->getReplyTo()];
        }

        return null;
    }

    public function getVersion(): string
    {
        return $this->version;
    }
}
