<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Helper\EnvHelper;
use League\Csv\Writer;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

class CreateUsersCSVCommand extends ContainerAwareCommand
{
    /**
     * @var Writer
     */
    protected $csvWriter;

    protected function configure()
    {
        $this
            ->setName('capco:export:users')
            ->setDescription('Export user list')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $container = $this->getContainer();
        $router = $container->get('router');
        $userRepository = $container->get('doctrine')->getManager()->getRepository('CapcoUserBundle:User');

        $filename = date('Y-m-d').'_users_'.EnvHelper::get('SYMFONY_INSTANCE_NAME').'.csv';

        $this->csvWriter = Writer::createFromPath($container->getParameter('kernel.root_dir').'/../web/export/'.$filename, 'w');
        $this->csvWriter->setDelimiter(',');
        $this->csvWriter->setNewline("\r\n");
        $this->csvWriter->setOutputBOM(Writer::BOM_UTF8);

        $users = $userRepository->findAll();

        $i = 1;
        $output->writeln('<info>Exporting all users to '.$filename.'</info>');
        $this->addCSVHeaders();

        $progressBar = new ProgressBar($output);
        $progressBar->start(count($users));

        foreach ($users as $user) {
            $this->csvWriter->insertOne([
                $user->getId(),
                $user->getEmail(),
                $user->getUsername(),
                $user->getCreatedAt() ? $user->getCreatedAt()->format(\DateTime::ATOM) : '',
                $user->getUpdatedAt() ? $user->getUpdatedAt()->format(\DateTime::ATOM) : '',
                $user->getLastLogin() ? $user->getLastLogin()->format(\DateTime::ATOM) : '',
                $this->convertRolesToString($user->getRoles()),
                $user->isVip(),
                $user->isEnabled(),
                $user->isLocked(),
                $user->isPhoneConfirmed(),
                $user->getSmsConfirmationSentAt() ? $user->getSmsConfirmationSentAt()->format(\DateTime::ATOM) : '',
                $user->getUserType() ? $user->getUserType()->getName() : '',
                $this->convertType($user->getGender()),
                $user->getFirstname(),
                $user->getLastname(),
                $user->getDateOfBirth() ? $user->getDateOfBirth()->format(\DateTime::ATOM) : '',
                $user->getWebsite(),
                $user->getBiography(),
                $user->getAddress(),
                $user->getAddress2() ?? '',
                (string) $user->getZipCode(),
                $user->getCity(),
                (string) $user->getNeighborhood(),
                (string) $user->getPhone(),
                !empty($user->getSlug()) ? $router->generate('capco_user_profile_show_all', ['slug' => $user->getSlug()], UrlGeneratorInterface::ABSOLUTE_URL) : '',
                (string) $user->getGoogleId(),
                (string) $user->getFacebookId(),
                (string) $user->getSamlId(),
                $user->getOpinionsCount(),
                $user->getOpinionVotesCount(),
                $user->getOpinionVersionsCount(),
                $user->getArgumentsCount(),
                $user->getArgumentVotesCount(),
                $user->getProposalsCount(),
                $user->getProposalVotesCount(),
                $user->getCommentsCount(),
                $user->getSourcesCount(),
                $user->getSourceVotesCount(),
                $user->getRepliesCount(),
                $user->getIdeasCount(),
                $user->getIdeaVotesCount(),
                $user->getIdeaCommentsCount(),
                $user->getPostCommentsCount(),
                $user->getEventCommentsCount(),
                $user->getProjectsCount(),
            ]);
            ++$i;
            $progressBar->advance();
        }

        $output->writeln('');
        $output->writeln('<info>'.$i.' exported user.</info>');
    }

    protected function addCSVHeaders()
    {
        $this->csvWriter->insertOne([
            'ID',
            'Adresse email',
            'Nom ou pseudo',
            'Date de création',
            'Date de dernière modification',
            'Date de dernière connexion',
            'Rôle',
            'VIP',
            'Activé',
            'Verrouillé',
            'Compte vérifié par SMS',
            'Date d\'envoi du SMS de confirmation',
            'Type de profil',
            'Civilité',
            'Prénom',
            'Nom',
            'Date de naissance',
            'Site internet',
            'Biographie',
            'Adresse postale',
            'Complément d\'adresse',
            'Code postal',
            'Ville',
            'Localisation',
            'Téléphone',
            'Lien vers le profil',
            'Google ID',
            'Facebook ID',
            'SAML ID',
            'Nombre de propositions (consultations)',
            'Nombre de votes (propositions consultations)',
            'Nombre de modifications',
            'Nombre de votes (modifications)',
            'Nombre d\'arguments',
            'Nombre de votes (arguments)',
            'Nombre de propositions (dépôts)',
            'Nombre de votes (propositions dépôts)',
            'Nombre de commentaires (propositions dépôts)',
            'Nombre de sources',
            'Nombre de votes (sources)',
            'Nombre de réponses (questionnaires)',
            'Nombre d\'idées',
            'Nombre de votes (idées)',
            'Nombre de commentaires (idées)',
            'Nombre de commentaires (articles)',
            'Nombre de commentaires (événements)',
            'Nombre de projets',
        ]);
    }

    protected function convertRolesToString(array $roles): string
    {
        $convertedRoles = array_map(function ($role) {
            return str_replace(
                ['ROLE_USER', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'],
                ['Utilisateur', 'Administrateur', 'Super Admin'],
                $role
            );
        }, $roles);

        return implode('|', $convertedRoles);
    }

    protected function convertType(string $type): string
    {
        if ($type === 'u') {
            return 'Non communiqué';
        }
        if ($type === 'm') {
            return 'Homme';
        }

        return 'Femme';
    }
}
