<?php

namespace Capco\AppBundle\Behat;

use Capco\AppBundle\Helper\EnvHelper;
use Symfony\Component\HttpKernel\KernelInterface;
use Alex\MailCatcher\Behat\MailCatcherContext as Base;
use Behat\Symfony2Extension\Context\KernelAwareContext;
use Caxy\HtmlDiffBundle\Service\HtmlDiffService;

class MailCatcherContext extends Base implements KernelAwareContext
{
    public const SNAPSHOTS_PATH = '/var/www/__snapshots__/emails/';
    public const SNAPSHOTS_DIFF_PATH = '/var/www/__snapshots-diff__/';

    /**
     * {@inheritdoc}
     */
    public function setKernel(KernelInterface $kernel)
    {
        $this->kernel = $kernel;
    }

    /**
     * @Then email should match snapshot :file and has :number blog articles
     */
    public function emailContentShouldMatchBlogActivity(string $file, string $number)
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
            throw new \RuntimeException(sprintf('Unable to read mail'));
        }
        if (
            false ===
            strpos(
                $content,
                "new-article {&quot;%count%&quot;:${number},&quot;%num%&quot;:${number}}"
            )
        ) {
            throw new \InvalidArgumentException(sprintf('There is no blog post activity'));
        }
        if ($writeSnapshot) {
            $newSnapshot = fopen(self::SNAPSHOTS_PATH . $file, 'w');
            fwrite($newSnapshot, $content);
            chmod(self::SNAPSHOTS_PATH . $file, 0755);
            fclose($newSnapshot);
            echo "\"Snapshot writen at '${file}'. You can now relaunch the testsuite.\"";

            return;
        }

        $text = file_get_contents(self::SNAPSHOTS_PATH . $file);

        if (false === strpos($content, $text)) {
            // HtmlDiffService
            $diff = $this->kernel
                ->getContainer()
                ->get('caxy.html_diff')
                ->diff($content, $text);
            $dir = self::SNAPSHOTS_DIFF_PATH;
            if (!file_exists($dir)) {
                mkdir($dir, 0700);
            }
            $path = $dir . $file;
            $newDiff = fopen($path, 'w');
            fwrite(
                $newDiff,
                $diff . '<link type="text/css" href="https://capco.dev/codes.css" rel="stylesheet">'
            );
            fclose($newDiff);

            throw new \InvalidArgumentException(
                sprintf(
                    "Snapshots didn't match ! Use 'open %s'. To regenerate snapshots, use 'fab local.qa.snapshots:emails'.",
                    $path
                )
            );
        }
    }

    /**
     * @Then email should match snapshot :file
     */
    public function emailContentShouldMatch(string $file)
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
            throw new \RuntimeException(sprintf('Unable to read mail'));
        }
        if (
            false === strpos($content, 'new-actuality {&quot;%count%&quot;:1,&quot;%num%&quot;:1}')
        ) {
            throw new \InvalidArgumentException(sprintf('There is no blog post activity'));
        }

        if ($writeSnapshot) {
            $newSnapshot = fopen(self::SNAPSHOTS_PATH . $file, 'w');
            fwrite($newSnapshot, $content);
            chmod(self::SNAPSHOTS_PATH . $file, 0755);
            fclose($newSnapshot);
            echo "\"Snapshot writen at '${file}'. You can now relaunch the testsuite.\"";

            return;
        }

        $text = file_get_contents(self::SNAPSHOTS_PATH . $file);

        if (false === strpos($content, $text)) {
            // HtmlDiffService
            $diff = $this->kernel
                ->getContainer()
                ->get('caxy.html_diff')
                ->diff($content, $text);
            $dir = self::SNAPSHOTS_DIFF_PATH;
            if (!file_exists($dir)) {
                mkdir($dir, 0700);
            }
            $path = $dir . $file;
            $newDiff = fopen($path, 'w');
            fwrite(
                $newDiff,
                $diff . '<link type="text/css" href="https://capco.dev/codes.css" rel="stylesheet">'
            );
            fclose($newDiff);

            throw new \InvalidArgumentException(
                sprintf(
                    "Snapshots didn't match ! Use 'open %s'. To regenerate snapshots, use 'fab local.qa.snapshots:emails'.",
                    $path
                )
            );
        }
    }

    /**
     * @param Message $message
     *
     * @return Crawler
     */
    private function getCrawler(Message $message)
    {
        if (!class_exists('Symfony\Component\DomCrawler\Crawler')) {
            throw new \RuntimeException(
                'Can\'t crawl HTML: Symfony DomCrawler component is missing from autoloading.'
            );
        }

        return new Crawler($message->getPart('text/html')->getContent());
    }

    /**
     * @return Message|null
     */
    private function getCurrentMessage()
    {
        if (null === $this->currentMessage) {
            throw new \RuntimeException('No message selected');
        }

        return $this->currentMessage;
    }
}
