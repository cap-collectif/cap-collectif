<?php

namespace Capco\AppBundle\Command\Maker;

use ReflectionClass;
use RuntimeException;
use Capco\AppBundle\Command\Maker\Exception\NullableException;
use Capco\AppBundle\Utils\Text;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Question\ChoiceQuestion;
use Symfony\Component\Console\Question\Question;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Finder\Finder;
use Symfony\Component\HttpFoundation\File\Exception\FileException;

abstract class AbstractMaker extends Command
{
    const TEMPLATE_PATH = __DIR__ . '/templates';
    protected $parser;
    protected $entity;
    protected $finder;
    protected $fs;
    protected $fqcns;
    protected $helper;
    protected $sourcePath;
    protected $className;
    private $container;

    public function __construct(string $name = null, ContainerInterface $container)
    {
        $this->container = $container;
        parent::__construct($name);
    }

    /**
     * This method is meant to be overrided by any classes which extends AbstractMaker,
     * to set the template file.
     */
    abstract public function getTemplate(): string;

    /**
     * This method is meant to be overrided by any classes which extends AbstractMaker.
     * It allows to modify where the generated file will be located.
     */
    abstract public function getOutputDirectory(): string;

    /**
     * This method is meant to be overrided by any classes which extends AbstractMaker,
     * to set the template variables.
     */
    abstract public function getTemplateVars(): array;

    /**
     * Get additionnal directories in which entities will be searched in the method 'askEntity".
     */
    public function getDirectories(): array
    {
        return [];
    }

    /**
     * Get the directory search depth to use with the Finder component.
     */
    public function getDirectoryDepth(): string
    {
        return '< 3';
    }

    /**
     * Get additionnal directories in which entities will not be searched in the method 'askEntity".
     */
    public function getExcludedDirectories(): array
    {
        return [];
    }

    /**
     * Shortcut for the src folder.
     */
    public function getSourcePath(): string
    {
        return $this->sourcePath;
    }

    /**
     * Create the file in the specific getOutputDirectory() dir.
     * Return the path of the newly created file.
     */
    protected function makeFile(): string
    {
        $path =
            $this->getOutputDirectory() .
            ($this->entity ? '/' . $this->entity->getShortName() : '') .
            '/' .
            $this->className .
            '.php';

        $parsed = $this->parser->parseTemplate($this->getTemplate(), $this->getTemplateVars());

        if ($this->fs->exists($path)) {
            throw new FileException('File already exist.');
        }

        $this->fs->dumpFile($path, $parsed);

        return $path;
    }

    protected function initialize(InputInterface $input, OutputInterface $output): void
    {
        $this->parser = $this->getContainer()->get('capco.maker_parser');
        $this->sourcePath =
            $this->getContainer()
                ->get('kernel')
                ->getRootDir() . '/../src';
        $this->finder = new Finder();
        $defaultDirectories = ['src/Capco/AppBundle/Entity', 'src/Capco/UserBundle/Entity'];
        $directories = array_merge($this->getDirectories(), $defaultDirectories);
        foreach (
            $this->finder
                ->files()
                ->name('/\.php$/')
                ->depth($this->getDirectoryDepth())
                ->in($directories)
                ->exclude($this->getExcludedDirectories())
                ->sortByName()
            as $file
        ) {
            $this->fqcns[] = NamespaceResolver::getFullQualifiedClassName($file->getRealPath());
        }
        $this->helper = $this->getHelper('question');
        $this->fs = $this->getContainer()->get('filesystem');
    }

    protected function askEntity(
        InputInterface $input,
        OutputInterface $output,
        string $questionLabel,
        bool $nullable = false
    ): ?ReflectionClass {
        $questionLabel .= $nullable ? ' <info>[nullable]</info>' : '';
        $entity = $this->askSimpleQuestion($input, $output, $questionLabel, null, null, $nullable);
        if ($entity) {
            $found = null;
            foreach ($this->fqcns as $fqcn) {
                if (false !== strpos($fqcn, $entity)) {
                    $found[] = $fqcn;
                }
            }
            if (!$found) {
                throw new RuntimeException('The given entity was not found in the application');
            }
            if (\count($found) > 1) {
                return new ReflectionClass(
                    $this->askChoiceQuestion(
                        $input,
                        $output,
                        "'${entity}' was found in many entities. Please choose one below",
                        $found,
                        null,
                        $found
                    )
                );
            }
            $output->writeln("using <info>{$found[0]}</info>");

            return new ReflectionClass($found[0]);
        }
    }

    protected function askSimpleQuestion(
        InputInterface $input,
        OutputInterface $output,
        string $questionLabel,
        $default = null,
        $autocompleteValues = null,
        $nullable = false
    ): ?string {
        $question = new Question($questionLabel . PHP_EOL, $default);
        if ($autocompleteValues) {
            $question->setAutocompleterValues($autocompleteValues);
        }
        $question->setNormalizer(function ($value) {
            return $value ? trim($value) : null;
        });

        $response = $this->helper->ask($input, $output, $question);
        if (!$nullable && null === $response) {
            throw new NullableException();
        }

        return $response;
    }

    protected function askChoiceQuestion(
        InputInterface $input,
        OutputInterface $output,
        string $questionLabel,
        array $choices,
        $default = null,
        $autocompleteValues = null
    ): string {
        $question = new ChoiceQuestion($questionLabel . PHP_EOL, $choices, $default);
        if ($autocompleteValues) {
            $question->setAutocompleterValues($autocompleteValues);
        }
        $question->setNormalizer(function ($value) {
            return $value ? trim($value) : null;
        });

        return $this->helper->ask($input, $output, $question);
    }

    protected function askQuestionWithArrayResponse(
        InputInterface $input,
        OutputInterface $output,
        string $questionLabel,
        bool $nullable = true
    ): ?array {
        $questionLabel .= $nullable ? ' <info>[nullable]</info>' : '';
        $question = new Question($questionLabel . PHP_EOL);
        $question->setNormalizer(function ($value) {
            return trim($value);
        });
        $response = $this->helper->ask($input, $output, $question);
        if (!$nullable && ('' === $response || null === $response)) {
            throw new NullableException();
        }
        $responses = explode(',', $response);
        if (1 === \count($responses) && '' === $responses[0]) {
            return null;
        }

        return array_map(function ($value) {
            return trim(Text::camelCase($value));
        }, $responses);
    }

    private function getContainer()
    {
        return $this->container;
    }
}
