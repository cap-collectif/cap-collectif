<?php
namespace Capco\AppBundle\Mailer\Mailjet\MessageFormat;

/**
 * https://github.com/mailjet/MailjetSwiftMailer
 */
abstract class BaseMessagePayload implements MessageFormatStrategyInterface
{
    protected static function getMessagePrimaryContentType(
        \Swift_Mime_SimpleMessage $message
    ): string {
        $contentType = $message->getContentType();

        if (self::supportsContentType($contentType)) {
            return $contentType;
        }
        // SwiftMailer hides the content type set in the constructor of Swift_Mime_SimpleMessage as soon
        // as you add another part to the message. We need to access the protected property
        // userContentType to get the original type.
        $messageRef = new \ReflectionClass($message);

        if ($messageRef->hasProperty('userContentType')) {
            $propRef = $messageRef->getProperty('userContentType');
            $propRef->setAccessible(true);
            $contentType = $propRef->getValue($message);
        }

        return $contentType;
    }

    private static function getSupportedContentTypes(): array
    {
        return ['text/plain', 'text/html'];
    }

    protected static function supportsContentType(string $contentType): bool
    {
        return \in_array($contentType, self::getSupportedContentTypes(), true);
    }

    protected static function prepareHeaders(
        \Swift_Mime_SimpleMessage $message,
        array $mailjetHeaders
    ): array {
        $messageHeaders = $message->getHeaders();

        $mailjetData = [];

        foreach (array_keys($mailjetHeaders) as $headerName) {
            /** @var \Swift_Mime_Header $value */
            if (null !== $value = $messageHeaders->get($headerName)) {
                // Handle custom headers
                if ($headerName === 'X-MJ-Vars' && \is_string($value)) {
                    $mailjetData[$mailjetHeaders[$headerName]] = json_decode($value);
                } else {
                    $mailjetData[$mailjetHeaders[$headerName]] = $value;
                }
                // remove Mailjet specific headers
                $messageHeaders->removeAll($headerName);
            }
        }

        return $mailjetData;
    }

    protected static function findUserDefinedHeaders(\Swift_Mime_SimpleMessage $message): array
    {
        $messageHeaders = $message->getHeaders();
        $userDefinedHeaders = [];
        // At this moment $messageHeaders is left with non-Mailjet specific headers
        /** @var \Swift_Mime_Headers_AbstractHeader $header */
        foreach ($messageHeaders->getAll() as $header) {
            if (0 === strpos($header->getFieldName(), 'X-')) {
                $userDefinedHeaders[$header->getFieldName()] = $header->getFieldBody();
            }
        }

        return $userDefinedHeaders;
    }

    abstract public function getMailjetMessage(\Swift_Mime_SimpleMessage $message): array;

    abstract public function getVersion(): string;
}
