<?php

declare(strict_types=1);

namespace Capco\AppBundle\DataFixtures\Processor;

use Fidry\AliceDataFixtures\ProcessorInterface;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Output\OutputInterface;

/**
 * This processor add a symfony ProgressBar to our fixtures loading.
 */
class ProgressBarProcessor implements ProcessorInterface
{
    private const FIXTURES_COUNT = 4007;
    /*?OutputInterface*/ private $output;
    /*?ProgressBar*/ private $progressBar;

    public function setOutput(OutputInterface $output)
    {
        $this->output = $output;
    }

    public function finish()
    {
        $this->progressBar->finish();
    }

    public function preProcess(string $id, $object): void
    {
        if ($this->output) {
            if (!$this->progressBar) {
                ProgressBar::setFormatDefinition('custom', ' %current%/%max% -- %message%');
                $this->progressBar = new ProgressBar($this->output, self::FIXTURES_COUNT);
                $this->progressBar->setFormat('custom');
                $this->progressBar->setMessage('Pre processing…');
                $this->progressBar->start();
            }
            $this->progressBar->setMessage(
                'Pre processing…<info>' . $object::class . '</info>' . \PHP_EOL
            );
            $this->progressBar->advance();
        }
    }

    /**
     * {@inheritdoc}
     */
    public function postProcess(string $id, $object): void
    {
        if ($this->output) {
            $this->progressBar->setMessage(
                'Post processing…<info>' . $object::class . '</info>' . \PHP_EOL
            );
            $this->progressBar->advance();
        }
    }
}
