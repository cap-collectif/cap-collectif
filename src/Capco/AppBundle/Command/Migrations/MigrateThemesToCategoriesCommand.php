<?php

namespace Capco\AppBundle\Command\Migrations;

use Capco\AppBundle\Entity\ProposalCategory;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class MigrateThemesToCategoriesCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this->setName('capco:migrate:theme-to-categories')
            ->setDescription('Transform all themes in category for a specified collect step.')
            ->addArgument(
                'step',
                InputArgument::REQUIRED,
                'Please provide the slug of the collect step you want to migrate'
            )
            ->addOption(
                'force',
                false,
                InputOption::VALUE_NONE,
                'set this option to force the migration'
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        if (!$input->getOption('force')) {
            $output->writeln(
                'This command will permanently alter some data in your project, if you\'re sure you want to execute this migration, go ahead and add --force'
            );
            $output->writeln('Please set the --force option to run this command');

            return 1;
        }

        return $this->migrate($input, $output);
    }

    private function migrate(InputInterface $input, OutputInterface $output)
    {
        $collectStepSlug = $input->getArgument('step');
        $em = $this->getContainer()->get('doctrine.orm.entity_manager');

        $collectStep = $this->getContainer()
            ->get('capco.collect_step.repository')
            ->findOneBy(['slug' => $collectStepSlug]);
        if (!$collectStep || !$form = $collectStep->getProposalForm()) {
            $output->writeln(
                '<error>Unknown collect step' .
                    $collectStepSlug .
                    '. Please provide an existing collect step slug that is linked to a proposal form.</error>'
            );
            $output->writeln('<error>Cancelled. No migration executed.</error>');

            return 1;
        }

        $count = 0;

        $themes = $this->getContainer()
            ->get('capco.theme.repository')
            ->findAll();

        foreach ($themes as $theme) {
            $proposals = $this->getContainer()
                ->get('capco.proposal.repository')
                ->findBy([
                    'proposalForm' => $form,
                    'theme' => $theme,
                ]);
            if (\count($proposals) > 0) {
                $category = new ProposalCategory();
                $category->setName($theme->getTitle());
                $category->setForm($form);
                $em->persist($category);
                foreach ($proposals as $proposal) {
                    $proposal->setTheme(null);
                    $proposal->setCategory($category);
                }
                $em->flush();
                ++$count;
            }
        }

        $form->setUsingThemes(false);
        $form->setUsingCategories(true);
        $form->setCategoryMandatory(true);
        $em->flush();

        $output->writeln('Migration executed, ' . $count . ' categories created.');

        return 0;
    }
}
