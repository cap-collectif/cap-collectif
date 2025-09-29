<?php

namespace Capco\AppBundle\Behat;

use Alex\MailCatcher\Behat\MailCatcherAwareInterface;
use Alex\MailCatcher\Client;
use Alex\MailCatcher\Message;
use Behat\Behat\Context\Context;
use Behat\Behat\Context\TranslatableContext;
use Capco\AppBundle\Helper\EnvHelper;
use Symfony\Component\DomCrawler\Crawler;
use Symfony\Component\HttpKernel\KernelInterface;

class MailCatcherContext implements Context, TranslatableContext, MailCatcherAwareInterface
{
    final public const SNAPSHOTS_PATH = '/var/www/__snapshots__/emails/';
    final public const SNAPSHOTS_DIFF_PATH = '/var/www/__snapshots-diff__/';

    private Client|null $mailCatcherClient = null;
    private bool $purgeBeforeScenario = true;
    private Message|null $currentMessage = null;

    public function __construct(
        private readonly KernelInterface $kernel
    ) {
    }

    /**
     * Sets mailcatcher configuration.
     *
     * purgeBeforeScenario: set false if you don't want context to purge before scenario
     */
    public function setMailCatcherConfiguration(bool $purgeBeforeScenario = true): void
    {
        $this->purgeBeforeScenario = $purgeBeforeScenario;
    }

    /**
     * @BeforeScenario
     */
    public function beforeScenario(): void
    {
        if (!$this->purgeBeforeScenario) {
            return;
        }

        $this->currentMessage = null;

        try {
            $this->getMailCatcherClient()?->purge();
        } catch (\Exception $e) {
            @trigger_error('Unable to purge mailcatcher: ' . $e->getMessage());
        }
    }

    /**
     * @When /^I purge mails$/
     */
    public function purge(): void
    {
        $this->getMailCatcherClient()?->purge();
    }

    /**
     * @When /^I open mail from "([^"]+)"$/
     */
    public function openMailFrom(mixed $value): void
    {
        $message = $this->findMail(Message::FROM_CRITERIA, $value);

        $this->currentMessage = $message;
    }

    /**
     * @When /^I open mail containing "([^"]+)"$/
     */
    public function openMailContaining(mixed $value): void
    {
        $message = $this->findMail(Message::CONTAINS_CRITERIA, $value);

        $this->currentMessage = $message;
    }

    /**
     * @Then /^I should see mail from "([^"]+)"$/
     */
    public function seeMailFrom(mixed $value): void
    {
        $message = $this->findMail(Message::FROM_CRITERIA, $value);
    }

    /**
     * @Then /^I should see mail with subject "([^"]+)"$/
     */
    public function seeMailSubject(mixed $value): void
    {
        $message = $this->findMail(Message::SUBJECT_CRITERIA, $value);
    }

    /**
     * @Then /^I should see mail to "([^"]+)"$/
     */
    public function seeMailTo(mixed $value): void
    {
        $message = $this->findMail(Message::TO_CRITERIA, $value);
    }

    /**
     * @Then /^I should see mail containing "([^"]+)"$/
     */
    public function seeMailContaining(mixed $value): void
    {
        $message = $this->findMail(Message::CONTAINS_CRITERIA, $value);
    }

    /**
     * @Then /^(?P<count>\d+) mails? should be sent$/
     */
    public function verifyMailsSent(mixed $count): void
    {
        $count = (int) $count;
        $actual = $this->getMailCatcherClient()?->getMessageCount();

        if ($count !== $actual) {
            throw new \InvalidArgumentException(sprintf('Expected %d mails to be sent, got %d.', $count, $actual));
        }
    }

    /**
     * Returns list of definition translation resources paths.
     *
     * @return array<int, string>|false
     */
    public static function getTranslationResources(): array|false
    {
        return glob(__DIR__ . '/../i18n/*.xliff');
    }

    /**
     * This method is duplicated from MailCatcherTrait, for support in PHP 5.3.
     *
     * Sets the mailcatcher client.
     *
     * @param Client $client a mailcatcher client
     */
    public function setMailCatcherClient(Client $client): void
    {
        $this->mailCatcherClient = $client;
    }

    /**
     * This method is duplicated from MailCatcherTrait, for support in PHP 5.3.
     *
     * Returns the mailcatcher client.
     *
     * @throws \RuntimeException client if missing from context
     */
    public function getMailCatcherClient(): null|Client
    {
        if (null === $this->mailCatcherClient) {
            throw new \RuntimeException('No MailCatcher client injected.');
        }

        return $this->mailCatcherClient;
    }

    /**
     * @Then email should match snapshot :file
     */
    public function emailContentShouldMatch(string $file): void
    {
        $writeSnapshot = EnvHelper::get('UPDATE_SNAPSHOTS');

        $message = $this->getCurrentMessage();

        if (!$message->isMultipart()) {
            $content = $message->getContent();
        } elseif ($message->hasPart('text/html')) {
            $content = $this->getCrawler($message)->text();
        } elseif ($message->hasPart('text/plain')) {
            $content = $message->getPart('text/plain')->getContent();
        } else {
            throw new \RuntimeException('Unable to read mail');
        }

        if ($writeSnapshot) {
            $newSnapshot = fopen(self::SNAPSHOTS_PATH . $file, 'w');
            fwrite($newSnapshot, (string) $content);
            chmod(self::SNAPSHOTS_PATH . $file, 0777);
            fclose($newSnapshot);
            echo "\"Snapshot writen at '{$file}'. You can now relaunch the testsuite.\"";

            return;
        }

        $text = file_get_contents(self::SNAPSHOTS_PATH . $file);

        if (!str_contains((string) $content, $text)) {
            // HtmlDiffService
            $diff = $this->kernel
                ->getContainer()
                ->get('caxy.html_diff')
                ->diff($content, $text)
            ;
            $dir = self::SNAPSHOTS_DIFF_PATH;
            if (!file_exists($dir)) {
                mkdir($dir, 0777);
            }
            $path = $dir . $file;
            $newDiff = fopen($path, 'w');
            fwrite(
                $newDiff,
                $diff . '<link type="text/css" href="https://capco.dev/codes.css" rel="stylesheet">'
            );
            fclose($newDiff);

            $message = sprintf(
                "Snapshots didn't match ! Use 'open %s'. To regenerate snapshots, use 'fab local.qa.snapshots:emails'.",
                $path
            );

            echo $message;

            // Temporarily disable snapshot email testing, while we fix https://github.com/cap-collectif/platform/issues/13000
            // throw new \InvalidArgumentException($message);
        }
    }

    /**
     * @When I open mail with subject :subject from :from to :to
     */
    public function openMailSubjectFromTo(mixed $subject, mixed $from, mixed $to): void
    {
        $criterias = [
            'from' => $from,
            'subject' => $subject,
            'to' => $to,
        ];

        $message = $this->getMailCatcherClient()->searchOne($criterias);

        if (!$message) {
            throw new \InvalidArgumentException(sprintf('Unable to find a message with criterias "%s".', json_encode($criterias)));
        }

        $this->currentMessage = $message;
    }

    /**
     * @Then I should see :text in mail
     */
    public function seeInMail(mixed $text): void
    {
        $message = $this->getCurrentMessage();
        if (null === $message) {
            throw new \RuntimeException('No message selected');
        }

        if (!$message->isMultipart()) {
            $content = $message->getContent();
        } elseif ($message->hasPart('text/html')) {
            $content = $this->getCrawler($message)->text();
        } elseif ($message->hasPart('text/plain')) {
            $content = $message->getPart('text/plain')->getContent();
        } else {
            throw new \RuntimeException('Unable to read mail');
        }
        if (!str_contains((string) $content, (string) $text)) {
            throw new \InvalidArgumentException(sprintf("Unable to find text \"%s\" in current message:\n%s", $text, $message->getContent()));
        }
    }

    /**
     * @When I open mail with subject :subject
     */
    public function openMailSubject(mixed $subject): void
    {
        $message = $this->findMail(Message::SUBJECT_CRITERIA, $subject);

        $this->currentMessage = $message;
    }

    /**
     * @When I open mail to :to
     */
    public function openMailTo(mixed $to): void
    {
        $message = $this->findMail(Message::TO_CRITERIA, $to);

        $this->currentMessage = $message;
    }

    /**
     * @Then /^I should not see mail with subject "([^"]+)"$/
     */
    public function notSeeMailSubject(mixed $value): void
    {
        $this->findMail(Message::SUBJECT_CRITERIA, $value, true);
    }

    protected function findMail($type, $value, $negation = false): Message
    {
        $criterias = [$type => $value];

        $message = $this->getMailCatcherClient()?->searchOne($criterias);

        if (null === $message) {
            // If no message was found but we wanted to NOT see a message, return a fake message to make the test pass
            if ($negation) {
                return new Message($this->mailCatcherClient);
            }

            throw new \InvalidArgumentException(sprintf('Unable to find a message with criterias "%s".', json_encode($criterias)));
        }

        if ($negation) {
            // If a message was found but we wanted to NOT see a message, throw an exception
            throw new \InvalidArgumentException(sprintf('A message corresponding to your criterias was found : "%s".', json_encode($criterias)));
        }

        return $message;
    }

    private function getCrawler(Message $message): Crawler
    {
        if (!class_exists(Crawler::class)) {
            throw new \RuntimeException('Can\'t crawl HTML: Symfony DomCrawler component is missing from autoloading.');
        }

        return new Crawler($message->getPart('text/html')->getContent());
    }

    private function getCurrentMessage(): Message|null
    {
        if (null === $this->currentMessage) {
            throw new \RuntimeException('No message selected');
        }

        return $this->currentMessage;
    }
}
