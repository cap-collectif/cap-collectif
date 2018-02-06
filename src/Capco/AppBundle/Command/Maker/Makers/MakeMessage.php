<?php

namespace Capco\AppBundle\Command\Maker\Makers;

use Capco\AppBundle\Command\Maker\AbstractMaker;
use Capco\AppBundle\Utils\Text;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class MakeMessage extends AbstractMaker
{
    protected $className;
    protected $type;
    protected $subject;
    protected $content;
    protected $templateVars;
    protected $subjectVars;

    public function getTemplate(): string
    {
        return self::TEMPLATE_PATH . '/Message.tpl.php';
    }

    public function getOutputDirectory(): string
    {
        return $this->getSourcePath() . '/Capco/AppBundle/Mailer/Message';
    }

    public function getTemplateVars(): array
    {
        return [
            'command_class_name' => $this->className,
            'command_entity_name' => $this->entity ? $this->entity->getShortName() : null,
            'command_entity_name_camelCase' => $this->entity ? Text::camelCase($this->entity->getShortName()) : null,
            'command_related_entity_fqcn' => $this->entity ? $this->entity->getName() : null,
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
        $this->entity = $this->askEntity($input, $output, 'Please type the related entity of your message <info>(e.g Proposal)</info>', true);

        $this->className = $this->askSimpleQuestion($input, $output,
            'Please type your message name <info>(e.g ' . ($this->entity ? $this->entity->getShortName() : 'Proposal') . 'Create)</info>');
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

        $path = $this->makeFile();

        $output->writeln('<info>File successfully written at ' . realpath($path) . '</info>');
    }
}
