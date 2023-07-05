<?php

namespace Capco\AppBundle\Command\Maker\Makers;

use Capco\AppBundle\Command\Maker\AbstractMaker;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class MakeNotifier extends AbstractMaker
{
    public function getTemplate(): string
    {
        return self::TEMPLATE_PATH . '/Notifier.tpl.php';
    }

    public function getOutputDirectory(): string
    {
        return $this->getSourcePath() . '/Capco/AppBundle/Notifier';
    }

    public function getTemplateVars(): array
    {
        return [
            'command_class_name' => $this->className,
            'command_notifier_type' => 'BaseNotifier',
        ];
    }

    protected function configure(): void
    {
        $this->setName('capco:make:notifier')
            ->setDescription('Generate a notifier')
            ->addArgument(
                'name',
                InputArgument::REQUIRED,
                "The name of your notifier. You don't need to put the suffix Notifier, it will be automatically added."
            )
        ;
    }

    protected function interact(InputInterface $input, OutputInterface $output): void
    {
        if (!$input->getArgument('name')) {
            $input->setArgument(
                'name',
                $this->askSimpleQuestion(
                    $input,
                    $output,
                    'Please specify the name of your notifier. Note that Notifier suffix will be automatically added. <info>(e.g Proposal)</info>'
                )
            );
        }
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->className = $input->getArgument('name');
        $this->className = str_replace('Notifier', '', $this->className);
        $this->className .= 'Notifier';

        $path = $this->makeFile();

        $output->writeln('<info>File successfully written at ' . realpath($path) . '</info>');

        return 0;
    }
}
