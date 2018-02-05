<?php

namespace Capco\AppBundle\Command\Maker;

use Capco\AppBundle\Utils\Text;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Question\ChoiceQuestion;
use Symfony\Component\Console\Question\Question;
use Symfony\Component\Finder\Finder;

class MakerCommand extends ContainerAwareCommand
{
    const TEMPLATE_PATH = __DIR__ . '/templates';
    protected $helper;
    protected $fqcns;

    protected function configure()
    {
        $this
            ->setName('capco:make:message')
            ->setDescription('Generate a message for notifications');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $this->fqcns = [];
        $container = $this->getContainer();
        $finder = new Finder();
        $directories = [
            'src/Capco/AppBundle/Entity',
            'src/Capco/UserBundle/Entity',
        ];
        foreach ($finder->files()->name('/\.php$/')->in($directories)->sortByName() as $file) {
            $this->fqcns[] = NamespaceResolver::getFullQualifiedClassName($file->getRealPath());
        }
        $this->helper = $this->getHelper('question');
        $messageTypes = ['External', 'Admin', 'Moderator'];
        $fs = $container->get('filesystem');
        $messageTemplatePath = self::TEMPLATE_PATH . '/Message.tpl.php';
        $entity = $this->askEntity($input, $output);
        $name = $this->askSimpleQuestion($input, $output, 'Please type your message name <info>(e.g ' . $entity->getShortName() . 'Create)</info>');
        $name .= 'Message';
        $type = $this->askChoiceQuestion($input, $output, 'Please select your message type <info>(defaults to External</info>)',
            $messageTypes,
            'External',
            $messageTypes
        );
        $type .= 'Message';
        $subject = $this->askSimpleQuestion($input, $output, 'Please type the translation key of the message subject');
        $content = $this->askSimpleQuestion($input, $output, 'Please type the translation key of the message content');

        $templateVars = $this->askQuestionWithArrayResponse($input, $output, 'Please type the names of the variables in the subject <info>(comma-separated list)</info>');
        $subjectVars = $this->askQuestionWithArrayResponse($input, $output, 'Please type the names of the variables in the content <info>(comma-separated list)</info>');

        $parsed = $this->parseTemplate($messageTemplatePath, [
            'command_class_name' => $name,
            'command_entity_name' => $entity->getShortName(),
            'command_entity_name_camelCase' => Text::camelCase($entity->getShortName()),
            'command_related_entity_fqcn' => $entity->getName(),
            'command_message_type' => $type,
            'command_subject_template' => $subject,
            'command_content_template' => $content,
            'command_template_vars' => $templateVars,
            'command_subject_vars' => $subjectVars,
        ]);
        $path = $container->get('kernel')->getRootDir() . '/../src/Capco/AppBundle/Mailer/Message/' . $entity->getShortName() . "/$name.php";
        $fs->dumpFile($path, $parsed);
        $output->writeln("<info>File successfully written at $path</info>");
    }

    private function askEntity(InputInterface $input, OutputInterface $output): \ReflectionClass
    {
        $entity = $this->askSimpleQuestion($input, $output, 'Please type the related entity of your message <info>(e.g Proposal)</info>');
        $found = null;
        foreach ($this->fqcns as $fqcn) {
            if (false !== strpos($fqcn, $entity)) {
                $found[] = $fqcn;
            }
        }
        if (!$found) {
            throw new \RuntimeException('The given entity was not found in the application');
        }
        if ($found > 1) {
            return new \ReflectionClass($this->askChoiceQuestion($input, $output, "'$entity' was found in many entities. Please choose one below", $found, null, $found));
        }

        return new \ReflectionClass($found[0]);
    }

    private function askSimpleQuestion(InputInterface $input,
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

    private function askChoiceQuestion(InputInterface $input,
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

    private function askQuestionWithArrayResponse(InputInterface $input,
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

    private function parseTemplate(string $templatePath, array $paramaters)
    {
        ob_start();
        extract($paramaters, EXTR_SKIP);
        include "$templatePath";

        return ob_get_clean();
    }
}
