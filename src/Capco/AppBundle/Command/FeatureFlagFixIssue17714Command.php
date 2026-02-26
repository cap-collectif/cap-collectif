<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'capco:feature-flag-fix-issue-1714',
    description: 'This is a one-shot command that will enable some feature flags in prod.',
)]
class FeatureFlagFixIssue17714Command extends Command
{
    public function __construct(private readonly Manager $featureFlagManager)
    {
        parent::__construct();
    }

    protected function configure(): void
    {
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->title('Activation des feature flags');

        try {
            // GÉNÉRAL
            // Utilisateurs
            $this->featureFlagManager->activate(Manager::noindex_on_profiles); // Balise "noindex" sur les profils

            // PERSONNALISATION
            // Affichage
            $this->featureFlagManager->activate(Manager::display_pictures_in_event_list); // Illustrations vignettes évènements
            $this->featureFlagManager->activate(Manager::http_redirects); // URL personalisée

            // Contenus
            $this->featureFlagManager->activate(Manager::blog); // Actualités
            $this->featureFlagManager->activate(Manager::calendar); // Évènements
            $this->featureFlagManager->activate(Manager::themes); // Thèmes

            // APPLICATIONS ET OUTILS
            // Dépôt
            $this->featureFlagManager->activate(Manager::districts); // Zone géographique
            $this->featureFlagManager->activate(Manager::votes_min); // Modalités de votes avancés

            // Questionnaire
            $this->featureFlagManager->activate(Manager::questionnaire_result); // Résultats des questionnaires

            // Consultation
            $this->featureFlagManager->activate(Manager::consultation_plan); // Plan de la consultation
            $this->featureFlagManager->activate(Manager::versions); // Amendements
            $this->featureFlagManager->activate(Manager::multi_consultations); // Multi consultations

            // Services externes
            $this->featureFlagManager->activate(Manager::twilio); // Twilio

            // Outil d’emailing
            $this->featureFlagManager->activate(Manager::emailing_group); // Groupes

            // INFRASTRUCTURE
            // Développeur
            $this->featureFlagManager->activate(Manager::sentry_log); // Sentry
            $this->featureFlagManager->activate(Manager::report_browers_errors_to_sentry); // Envoyer les erreurs JS des visiteurs à Sentry
            $this->featureFlagManager->activate(Manager::analytics_page); // Dashboard
            $this->featureFlagManager->activate(Manager::emailing); // Outil d’emailing
            $this->featureFlagManager->activate(Manager::emailing_parameters); // Paramétrage de l'envoi des emails
            $this->featureFlagManager->activate(Manager::import_proposals); // Import de propositions
            $this->featureFlagManager->activate(Manager::proposal_revisions); // Révision des propositions
            $this->featureFlagManager->activate(Manager::paper_vote); // Vote papier
        } catch (\Throwable $exception) {
            $io->error($exception->getMessage());

            return Command::FAILURE;
        }

        $io->success('Terminé');

        return Command::SUCCESS;
    }
}
