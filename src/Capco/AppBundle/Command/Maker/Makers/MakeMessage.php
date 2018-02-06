<?php

namespace Capco\AppBundle\Command\Maker\Makers;

use Capco\AppBundle\Command\Maker\AbstractMaker;
use Capco\AppBundle\Utils\Text;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class MakeMessage extends AbstractMaker
{
    protected $className;
    protected $entity;
    protected $type;
    protected $subject;
    protected $content;
    protected $templateVars;
    protected $subjectVars;

    public function getTemplate(): string
    {
        return self::TEMPLATE_PATH . '/Message.tpl.php';
    }

    public function getTemplateVars(): array
    {
        return [
            'command_class_name' => $this->className,
            'command_entity_name' => $this->entity->getShortName(),
            'command_entity_name_camelCase' => Text::camelCase($this->entity->getShortName()),
            'command_related_entity_fqcn' => $this->entity->getName(),
            'command_message_type' => $this->type,
            'command_subject_template' => $this->subject,
            'command_content_template' => $this->content,
            'command_template_vars' => $this->templateVars,
            'command_subject_vars' => $this->subjectVars,
        ];
    }

    protected function configure()
    {
        $this
            ->setName('capco:make:message')
            ->setDescription('Generate a message for notifications');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $messageTypes = ['External', 'Admin', 'Moderator'];
        $this->entity = $this->askEntity($input, $output, 'Please type the related entity of your message <info>(e.g Proposal)</info>');

        $this->className = $this->askSimpleQuestion($input, $output, 'Please type your message name <info>(e.g ' . $this->entity->getShortName() . 'Create)</info>');
        $this->className .= 'Message';
        $this->type = $this->askChoiceQuestion($input, $output, 'Please select your message type <info>(defaults to External</info>)',
            $messageTypes,
            'External',
            $messageTypes
        );
        $this->type .= 'Message';
        $this->subject = $this->askSimpleQuestion($input, $output, 'Please type the translation key of the message subject');
        $this->content = $this->askSimpleQuestion($input, $output, 'Please type the translation key of the message content');

        $this->templateVars = $this->askQuestionWithArrayResponse($input, $output, 'Please type the names of the variables in the subject <info>(comma-separated list)</info>');
        $this->subjectVars = $this->askQuestionWithArrayResponse($input, $output, 'Please type the names of the variables in the content <info>(comma-separated list)</info>');

        $parsed = $this->parser->parseTemplate(
            $this->getTemplate(),
            $this->getTemplateVars()
        );

        $path = $this->getContainer()->get('kernel')->getRootDir() . '/../src/Capco/AppBundle/Mailer/Message/' . $this->entity->getShortName() . '/' . $this->className . '.php';
        $this->fs->dumpFile($path, $parsed);
        $output->writeln("<info>File successfully written at $path</info>");
    }
}
