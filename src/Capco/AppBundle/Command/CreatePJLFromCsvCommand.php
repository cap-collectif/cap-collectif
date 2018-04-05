<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Entity\AppendixType;
use Capco\AppBundle\Entity\MenuItem;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionAppendix;
use Capco\AppBundle\Entity\OpinionModal;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\OpinionTypeAppendixType;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\ConsultationStepType;
use Capco\AppBundle\Entity\Steps\OtherStep;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\Entity\Steps\RankingStep;
use Capco\AppBundle\Entity\Steps\SynthesisStep;
use Capco\AppBundle\Entity\Synthesis\Synthesis;
use Capco\UserBundle\Entity\User;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class CreatePJLFromCsvCommand extends ContainerAwareCommand
{
    private $opinionTypes = [];
    private $username = 'Gouvernement';
    private $password = 'KvN+j\E43&2U%KAF';

    private static $siteParameters = [
        'admin.mail.notifications.send_address' => 'coucou@cap-collectif.com',
        'admin.mail.notifications.receive_address' => 'assistance@cap-collectif.com',
        'admin.mail.contact' => 'coucou@cap-collectif.com',

        'homepage.jumbotron.button' => '',
        'homepage.jumbotron.title' => 'Projet de loi Numérique',
        'homepage.jumbotron.darken' => 0,
        'global.site.fullname' => 'République Numérique',
        'homepage.jumbotron.body' => '<p><span style="color:#FFFFFF ">Contribuez au projet de loi pour une r&eacute;publique num&eacute;rique</span></p>',
    ];

    private static $siteColors = [
        'color.body.bg' => '#ffffff',
        'color.body.text' => '#333333',
        'color.header.bg' => '#01a0d0',
        'color.header.title' => '#ffffff',
        'color.home.bg' => '#0b6ba8',
        'color.home.title' => '#ffffff',
        'color.header.text' => '#333333',
        'color.header2.bg' => '#ffffff',
        'color.header2.text' => '#333333',
        'color.header2.title' => '#0b6ba8',
        'color.btn.bg' => '#0b6ba8',
        'color.btn.text' => '#ffffff',

        'color.h1' => '#000000',
        'color.h2' => '#0b6ba8',
        'color.h3' => '#01a0d0',
        'color.h4' => '#3c4046',
        'color.h5' => '#202328',
        'color.h6' => '#3c4046',

        'color.btn.primary.bg' => '#0b6ba8',
        'color.btn.primary.text' => '#ffffff',
        'color.btn.ghost.hover' => '#ffffff',
        'color.btn.ghost.base' => '#01a0d0',

        'color.link.default' => '#01a0d0',
        'color.link.hover' => '#0b6ba8',
        'color.footer.text' => '#ffffff',
        'color.footer.bg' => '#3c4046',

        'color.footer2.text' => '#ffffff',
        'color.footer2.bg' => '#202328',
        'color.section.bg' => '#f6f6f6',
        'color.section.text' => '#000000',

        'color.main_menu.text' => '#333333',
        'color.main_menu.text_active' => '#ffffff',
        'color.main_menu.text_hover' => '#ffffff',
        'color.main_menu.bg' => '#ffffff',
        'color.main_menu.bg_active' => '#0b6ba8',

        'color.footer.title' => '#ffffff',
        'color.user.vip.bg' => '#ffffff',
    ];

    protected function findOpinionTypeByTitle($title, $parentTitle = false, $rootTitle = false)
    {
        foreach ($this->opinionTypes as $type) {
            if ($type->getTitle() === $title) {
                if (!$parentTitle) {
                    return $type;
                }

                $parent = $type->getParent();
                if ($parent->getTitle() === $parentTitle) {
                    if (!$rootTitle) {
                        return $type;
                    }
                    $root = $parent->getParent();

                    if ($root->getTitle() === $rootTitle) {
                        return $type;
                    }
                }
            }
        }
        throw new \InvalidArgumentException('Unknown opinion title: ' . $title, 1);
    }

    protected function configure()
    {
        $this
        ->setName('capco:import:pjl-from-csv')
        ->setDescription('Import from CSV file');
    }

    protected function toggleFeatures()
    {
        $toggleManager = $this->getContainer()->get('capco.toggle.manager');
        $toggleManager->deactivate('blog');
        $toggleManager->deactivate('calendar');
        $toggleManager->deactivate('newsletter');
        $toggleManager->deactivate('ideas');
        $toggleManager->deactivate('idea_creation');
        $toggleManager->deactivate('themes');
        $toggleManager->activate('registration');
        $toggleManager->activate('login_facebook');
        $toggleManager->activate('login_gplus');
        $toggleManager->deactivate('login_twitter');
        $toggleManager->activate('user_type');
        $toggleManager->activate('members_list');
        $toggleManager->deactivate('projects_form');
        $toggleManager->activate('share_buttons');
        $toggleManager->activate('project_trash');
        $toggleManager->deactivate('idea_trash');
        $toggleManager->activate('reporting');
        $toggleManager->deactivate('shield_mode');
    }

    protected function generateDefaultContent()
    {
        $em = $this->getContainer()->get('doctrine')->getManager();

        $userType = $em->getRepository('CapcoUserBundle:UserType')
                       ->findOneBySlug('institution');
        $citoyenType = $em->getRepository('CapcoUserBundle:UserType')
                       ->findOneBySlug('citoyen');

        $user = new User();
        $user->setUsername($this->username);
        $user->setEmail('gouv@gouv.fr');
        $user->setPlainPassword($this->password);
        $user->setEnabled(true);
        $user->setUserType($userType);
        $user->setVip(true);
        $em->persist($user);

        $bertrand = new User();
        $bertrand->setUsername('Bertrand Pailhès');
        $bertrand->setEmail('pailhes@gmail.com');
        $bertrand->setPlainPassword('testtest');
        $bertrand->setEnabled(true);
        $user->setUserType($citoyenType);
        $em->persist($bertrand);

        foreach (self::$siteParameters as $key => $value) {
            $param = $em->getRepository('CapcoAppBundle:SiteParameter')
                        ->findOneByKeyname($key)
                    ;
            $param->setValue($value);
        }

        foreach (self::$siteColors as $key => $value) {
            $param = $em->getRepository('CapcoAppBundle:SiteColor')
                        ->findOneByKeyname($key)
                    ;
            $param->setValue($value);
        }

        foreach ($em->getRepository('CapcoAppBundle:SocialNetwork')->findAll() as $sn) {
            $sn->setIsEnabled(true);
            if ($sn->getTitle() === 'Twitter') {
                $sn->setLink('https://twitter.com/axellelemaire');
            } else {
                $sn->setIsEnabled(false);
            }
        }

        foreach ($em->getRepository('CapcoAppBundle:Section')->findAll() as $section) {
            $section->setEnabled(false);
            if ($section->getTitle() === 'Introduction') {
                $section->setEnabled(true);
                $section->setTitle('Construisons ensemble la République Numérique');
                $section->setBody('Le numérique et ses usages sont au cœur d’un vaste mouvement de transformation de notre économie, de redéfinition de nos espaces publics et privés, et de construction du lien social. Les conséquences de ces évolutions sont dès à présent globales, et dessinent l’avenir de l’ensemble de notre société. La République du 21e siècle sera nécessairement numérique : elle doit anticiper les changements à l’œuvre, en saisir pleinement les opportunités, et dessiner une société conforme à ses principes de liberté, d’égalité et de fraternité.');
            }
        }

        $em->getRepository('CapcoAppBundle:MenuItem')
               ->findOneByTitle('Projets participatifs')
               ->setIsEnabled(false)
        ;

        $menuItem = new MenuItem();
        $menuItem->setTitle('Projet');
        $menuItem->setPosition(2);
        $menuItem->setMenu(1);
        $menuItem->setLink('projets/projet-de-loi-numerique/projet/projet');

        $em->persist($menuItem);
        $em->flush();
    }

    protected function generateMedias()
    {
        $em = $this->getContainer()->get('doctrine')->getManager();

        foreach ($em->getRepository('CapcoMediaBundle:Media')->findAll() as $media) {
            $media->setEnabled(false);
        }
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $this->getApplication()
             ->find('capco:load-prod-data')
             ->run(new ArrayInput([
                    'command' => 'capco:load-prod-data',
                    '--force' => true,
                ]), $output);

        $this->toggleFeatures();
        $this->generateDefaultContent();
        $this->generateMedias();
        $this->import($input, $output);
    }

    protected function import(InputInterface $input, OutputInterface $output)
    {
        $opinionTypesData = $this->getOpinionTypes();
        $opinions = $this->getOpinions();
        $motives = $this->getMotives();
        $modals = $this->getModals();

        $em = $this->getContainer()->get('doctrine')->getManager();

        $em->getRepository('CapcoUserBundle:User')
           ->findOneByEmail('admin@cap-collectif.com')
           ->setUsername('Cap Collectif')
           ;

        $user = $em->getRepository('CapcoUserBundle:User')
                   ->findOneByUsername($this->username);

        $progress = new ProgressBar($output, count($opinionTypesData) + count($opinions) + count($motives) + count($modals));
        $progress->start();

        $project = new Project();
        $project->setAuthor($user);
        $project->setTitle('Projet de loi numérique');
        $project->setPublishedAt(new \DateTime());
        $project->setOpinionsRankingThreshold(60);
        $project->setVersionsRankingThreshold(60);

        $projectAbsStep = new ProjectAbstractStep();
        $projectAbsStep->setPosition(1);

        $classementAbsStep = new ProjectAbstractStep();
        $classementAbsStep->setPosition(2);

        $syntheseAbsStep = new ProjectAbstractStep();
        $syntheseAbsStep->setPosition(3);

        $otherAbsStep = new ProjectAbstractStep();
        $otherAbsStep->setPosition(4);

        $consultationStep = new ConsultationStep();
        $consultationStep->setTitle('Projet');
        $consultationStep->setStartAt((new \DateTime())->modify('-1 day'));
        $consultationStep->setEndAt((new \DateTime())->modify('+3 weeks'));

        $classementStep = new RankingStep();
        $classementStep->setTitle('Réponses du gouvernement');
        $classementStep->setStartAt(new \DateTime('2015-10-26 09:00:00'));
        $classementStep->setNbOpinionsToDisplay(5);
        $classementStep->setNbVersionsToDisplay(5);

        $synthese = (new Synthesis())
            ->setSourceType('consultation_step')
            ->setConsultationStep($consultationStep)
            ->setEditable(true)
            ->setEnabled(false)
        ;
        $syntheseStep = new SynthesisStep();
        $syntheseStep->setTitle('Synthèse');
        $syntheseStep->setStartAt(new \DateTime('2015-10-26 09:00:00'));
        $syntheseStep->setSynthesis($synthese);

        $otherStep = new OtherStep();
        $otherStep->setTitle('Projet de loi définitif');
        $otherStep->setStartAt(new \DateTime('2015-11-25 09:00:00'));

        $consultationStepType = new ConsultationStepType();
        $consultationStepType->setTitle('PJL');

        $consultationStep->setConsultationStepType($consultationStepType);
        $projectAbsStep->setStep($consultationStep);

        $classementAbsStep->setStep($classementStep);
        $syntheseAbsStep->setStep($syntheseStep);
        $otherAbsStep->setStep($otherStep);

        $project->addStep($projectAbsStep);
        $project->addStep($classementAbsStep);
        $project->addStep($syntheseAbsStep);
        $project->addStep($otherAbsStep);

        $em->persist($project);
        $em->persist($consultationStepType);
        $em->flush();

        $position = 0;

        $exposayDayMotif = new AppendixType();
        $exposayDayMotif->setTitle('Exposé des motifs');
        $exposayDayMotif->setHelpText('Rentrez ici l\'exposé des motifs.');

        foreach ($opinionTypesData as $row) {
            $opinionType = new OpinionType();
            $opinionType->setTitle($row['title']);
            $opinionType->setSubtitle($row['subtitle']);
            $opinionType->setPosition($position);
            $opinionType->setColor('blue');
            $opinionType->setDefaultFilter('positions');
            $opinionType->setIsEnabled($row['contribuable']);
            $opinionType->setVersionable($row['contribuable']);
            $opinionType->setVotesHelpText('Pensez-vous que cette proposition permet d\'atteindre les objectifs du gouvernement ?');
            $exposayDayMotifType = new OpinionTypeAppendixType();
            $exposayDayMotifType->setAppendixType($exposayDayMotif);
            $exposayDayMotifType->setPosition(1);
            $opinionType->addAppendixType($exposayDayMotifType);

            if (!empty($row['parent'])) {
                $parent = $this->findOpinionTypeByTitle($row['parent'], $row['root']);
                if (!$parent) {
                    throw new \Exception('Parent does not exist', 1);
                }
                $opinionType->setParent($parent);
            }

            $opinionType->setConsultationStepType($consultationStepType);

            $em->persist($opinionType);
            $em->flush();
            $this->opinionTypes[] = $opinionType;
            ++$position;
            $progress->advance(1);
        }

        $i = 1;
        foreach ($opinions as $row) {
            $opinionType = $this->findOpinionTypeByTitle($row['opinionType'], $row['opinionType_parent'], $row['opinionType_root']);
            $opinion = $em->getRepository('CapcoAppBundle:Opinion')
                          ->findOneByTitle($row['opinion']);

            if (!is_object($opinion)) {
                $opinion = new Opinion();
                $opinion->setTitle($row['opinion']);
                $opinion->setOpinionType($opinionType);
                $opinion->setAuthor($user);
                $opinion->setStep($consultationStep);
                $opinion->setPosition($i);
                ++$i;
            }

            $content = $opinion->getBody();
            $content .= '<p>' . $row['paragraphe'] . '</p>';
            $opinion->setBody($content);

            $em->persist($opinion);
            $em->flush();
            $progress->advance(1);
        }

        foreach ($motives as $row) {
            $opinion = $em->getRepository('CapcoAppBundle:Opinion')
                          ->findOneByTitle($row['opinion']);

            if (!is_object($opinion)) {
                throw new \InvalidArgumentException('Unknown title: ' . $row['opinion'], 1);
            }

            if (count($opinion->getAppendices()) === 0) {
                $motif = new OpinionAppendix();
                $motif->setAppendixType($exposayDayMotif);
                $motif->setBody('<p>' . $row['motif'] . '</p>');
                $opinion->addAppendice($motif);
            } else {
                $motif = $opinion->getAppendices()[0];
                $content = $motif->getBody();
                $content .= '<p>' . $row['motif'] . '</p>';
                $motif->setBody($content);
            }

            $em->flush();
            $progress->advance(1);
        }

        foreach ($modals as $row) {
            $opinion = $em->getRepository('CapcoAppBundle:Opinion')
                          ->findOneByTitle($row['opinion']);

            if (!is_object($opinion)) {
                throw new \InvalidArgumentException('Unknown title: ' . $row['opinion'], 1);
            }

            $modal = new OpinionModal();
            $modal->setOpinion($opinion);
            $modal->setTitle($row['title']);
            $modal->setKey($row['key']);
            $modal->setBefore($row['before']);
            $modal->setAfter($row['after']);

            $em->persist($modal);
            $em->flush();
            $progress->advance(1);
        }

        $progress->finish();
    }

    protected function getOpinions()
    {
        return $this->getContainer()
                    ->get('import.csvtoarray')
                    ->convert('pjl/opinions.csv');
    }

    protected function getMotives()
    {
        return $this->getContainer()
                    ->get('import.csvtoarray')
                    ->convert('pjl/motifs.csv');
    }

    protected function getModals()
    {
        return $this->getContainer()
                    ->get('import.csvtoarray')
                    ->convert('pjl/modals.csv');
    }

    protected function getOpinionTypes()
    {
        return $this->getContainer()
                    ->get('import.csvtoarray')
                    ->convert('pjl/opinionTypes.csv');
    }
}
