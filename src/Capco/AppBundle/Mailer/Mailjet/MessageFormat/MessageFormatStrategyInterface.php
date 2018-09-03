<?php
namespace Capco\AppBundle\Mailer\Mailjet\MessageFormat;

/**
 * https://github.com/mailjet/MailjetSwiftMailer
 */
interface MessageFormatStrategyInterface
{
    public function getMailjetMessage(\Swift_Mime_SimpleMessage $message);

    public function getVersion();
}
