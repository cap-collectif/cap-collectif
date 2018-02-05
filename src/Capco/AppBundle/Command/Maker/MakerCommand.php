<?php

namespace Capco\AppBundle\Command\Maker;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Question\ChoiceQuestion;
use Symfony\Component\Console\Question\Question;

class MakerCommand extends ContainerAwareCommand
{
    protected $helper;

    protected function configure()
    {
        $this
            ->setName('capco:make:message')
            ->setDescription('Generate a message for notifications');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $this->helper = $this->getHelper('question');
        $messageTypes = ['External', 'Admin', 'Moderator'];
        $container = $this->getContainer();
        $fs = $container->get('filesystem');
        $templatePath = __DIR__ . '/templates/Message.tpl.php';
        $entity = $this->askSimpleQuestion($input, $output, 'Please type the related entity of your message <info>(e.g Proposal)</info>');
        $name = $this->askSimpleQuestion($input, $output, 'Please type your message name <info>(e.g ProposalCreate)</info>');
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

        $parsed = $this->parseTemplate($templatePath, [
            'command_class_name' => $name,
            'command_entity_name' => $entity,
            'command_message_type' => $type,
            'command_subject_template' => $subject,
            'command_content_template' => $content,
            'command_template_vars' => $templateVars,
            'command_subject_vars' => $subjectVars,
        ]);
        $path = $container->get('kernel')->getRootDir() . "/../src/Capco/AppBundle/Mailer/Message/$entity/$name.php";
        $fs->dumpFile($path, $parsed);
        $output->writeln("<info>File successfully written at $path</info>");
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
                                       array $choices = null,
                                       $default = null,
                                       $autocompleteValues = null,
                                       $capitalize = true): string
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
