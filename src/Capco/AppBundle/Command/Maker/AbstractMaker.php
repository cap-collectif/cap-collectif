<?php

namespace Capco\AppBundle\Command\Maker;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Question\ChoiceQuestion;
use Symfony\Component\Console\Question\Question;
use Symfony\Component\Finder\Finder;

abstract class AbstractMaker extends ContainerAwareCommand
{
    const TEMPLATE_PATH = __DIR__ . '/templates';
    protected $parser;
    protected $finder;
    protected $fs;
    protected $fqcns;
    protected $helper;

    abstract public function getTemplate(): string;

    abstract public function getTemplateVars(): array;

    public function getDirectories(): array
    {
        return [];
    }

    protected function initialize(InputInterface $input, OutputInterface $output): void
    {
        $this->parser = $this->getContainer()->get('capco.maker_parser');
        $this->finder = new Finder();
        $directories = $this->getDirectories();
        foreach ($this->finder->files()->name('/\.php$/')->in($directories)->sortByName() as $file) {
            $this->fqcns[] = NamespaceResolver::getFullQualifiedClassName($file->getRealPath());
        }
        $this->helper = $this->getHelper('question');
        $this->fs = $this->getContainer()->get('filesystem');
    }

    protected function askEntity(InputInterface $input, OutputInterface $output, string $question): \ReflectionClass
    {
        $entity = $this->askSimpleQuestion($input, $output, $question);
        $found = null;
        foreach ($this->fqcns as $fqcn) {
            if (false !== strpos($fqcn, $entity)) {
                $found[] = $fqcn;
            }
        }
        if (!$found) {
            throw new \RuntimeException('The given entity was not found in the application');
        }
        if (\count($found) > 1) {
            return new \ReflectionClass($this->askChoiceQuestion($input, $output, "'$entity' was found in many entities. Please choose one below", $found, null, $found));
        }
        $output->writeln("using <info>$found[0]</info>");

        return new \ReflectionClass($found[0]);
    }

    protected function askSimpleQuestion(InputInterface $input,
                                       OutputInterface $output,
                                       string $question,
                                       $default = null,
                                       $autocompleteValues = null): string
    {
        $q = new Question($question . PHP_EOL, $default);
        if ($autocompleteValues) {
            $q->setAutocompleterValues($autocompleteValues);
        }
        $q->setNormalizer(function ($value) {
            return $value ? trim($value) : null;
        });

        return $this->helper->ask($input, $output, $q);
    }

    protected function askChoiceQuestion(InputInterface $input,
                                       OutputInterface $output,
                                       string $question,
                                       array $choices,
                                       $default = null,
                                       $autocompleteValues = null): string
    {
        $q = new ChoiceQuestion(
            $question . PHP_EOL,
            $choices,
            $default
        );
        if ($autocompleteValues) {
            $q->setAutocompleterValues($autocompleteValues);
        }
        $q->setNormalizer(function ($value) {
            return $value ? trim($value) : null;
        });

        return $this->helper->ask($input, $output, $q);
    }

    protected function askQuestionWithArrayResponse(InputInterface $input,
                                                  OutputInterface $output,
                                                  string $question): array
    {
        $q = new Question($question . PHP_EOL);
        $q->setNormalizer(function ($value) {
            return trim($value);
        });
        $response = $this->helper->ask($input, $output, $q);
        $responses = explode(',', $response);

        return array_map(function ($value) {
            return trim($value);
        }, $responses);
    }
}
