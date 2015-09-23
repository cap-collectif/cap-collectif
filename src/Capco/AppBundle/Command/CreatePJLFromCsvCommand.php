<?php

namespace Capco\AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Helper\ProgressBar;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Synthesis\Synthesis;
use Capco\AppBundle\Entity\OpinionAppendix;
use Capco\AppBundle\Entity\OpinionTypeAppendixType;
use Capco\AppBundle\Entity\AppendixType;
use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\ConsultationAbstractStep;
use Capco\AppBundle\Entity\RankingStep;
use Capco\AppBundle\Entity\SynthesisStep;
use Capco\AppBundle\Entity\OtherStep;
use Capco\AppBundle\Entity\ConsultationStep;
use Capco\AppBundle\Entity\ConsultationType;
use Capco\AppBundle\Entity\OpinionModal;
use Capco\AppBundle\Entity\MenuItem;

class CreatePJLFromCsvCommand extends ContainerAwareCommand
{
    private $opinionTypes = [];
    private $username = 'Gouvernement';
    private $password = 'KvN+j\E43&2U%KAF';

    private $siteParameters = [
        'admin.mail.notifications.send_address' => 'coucou@cap-collectif.com',
        'admin.mail.notifications.receive_address' => 'assistance@cap-collectif.com',
        'admin.mail.contact' => 'coucou@cap-collectif.com',

        'homepage.jumbotron.button' => '',
        'homepage.jumbotron.title' => '',
        'homepage.jumbotron.body' => ' ',
        'homepage.jumbotron.darken' => 0,
        'global.site.fullname' => 'République Numérique',

        'security.shield_mode.username' => 'Cap Collectif',
        'security.shield_mode.password' => 'Rg6hd4Tg',

    ];

    private $siteColors = [
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
            if ($type->getTitle() == $title) {
                if (!$parentTitle) {
                    return $type;
                }

                $parent = $type->getParent();
                if ($parent->getTitle() == $parentTitle) {
                    if (!$rootTitle) {
                        return $type;
                    }
                    $root = $parent->getParent();

                    if ($root->getTitle() == $rootTitle) {
                        return $type;
                    }
                }
            }
        }
        throw new \Exception('Unknown opinion title: '.$title, 1);
    }

    protected function configure()
    {
        $this
        ->setName('import:pjl-from-csv')
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
        $toggleManager->deactivate('consultations_form');
        $toggleManager->activate('share_buttons');
        $toggleManager->activate('consultation_trash');
        $toggleManager->deactivate('idea_trash');
        $toggleManager->activate('reporting');
        $toggleManager->deactivate('shield_mode');
    }

    protected function generateDefaultContent()
    {
        $em = $this->getContainer()->get('doctrine')->getManager();

        $userType = $em->getRepository('CapcoUserBundle:UserType')
                       ->findOneBySlug('institution');

        $context = $em->getRepository('CapcoClassificationBundle:Context')
                      ->find('default');

        $media = $this->getContainer()
                      ->get('sonata.media.manager.media')
                      ->create();

        $user = new User();
        $user->setUserName($this->username);
        $user->setPlainPassword($this->password);
        $user->setEnabled(true);
        $user->setUserType($userType);
        $user->setVip(true);
        $em->persist($user);

        $bertrand = new User();
        $bertrand->setUserName('Bertrand Pailhès');
        $bertrand->setEmail('pailhes@gmail.com');
        $bertrand->setPlainPassword('testtest');
        $bertrand->setEnabled(true);
        $user->setUserType($userType);
        $em->persist($bertrand);

        foreach ($this->siteParameters as $key => $value) {
            $param = $em->getRepository('CapcoAppBundle:SiteParameter')
                        ->findOneByKeyname($key)
                    ;
            $param->setValue($value);
        }

        foreach ($this->siteColors as $key => $value) {
            $param = $em->getRepository('CapcoAppBundle:SiteColor')
                        ->findOneByKeyname($key)
                    ;
            $param->setValue($value);
        }

        foreach ($em->getRepository('CapcoAppBundle:SocialNetwork')->findAll() as $sn) {
            $sn->setIsEnabled(true);
            if ($sn->getTitle() == 'Twitter') {
                $sn->setLink('https://twitter.com/axellelemaire');
            } else {
                $sn->setIsEnabled(false);
            }
        }

        foreach ($em->getRepository('CapcoAppBundle:Section')->findAll() as $section) {
            $section->setEnabled(false);
            if ($section->getTitle() == 'Introduction') {
                $section->setEnabled(true);
            }
        }

        $em->getRepository('CapcoAppBundle:MenuItem')
               ->findOneByTitle('Consultations')
               ->setIsEnabled(false)
        ;

        $menuItem = new MenuItem();
        $menuItem->setTitle('Consultation');
        $menuItem->setPosition(2);
        $menuItem->setMenu(1);
        $menuItem->setLink('consultations/projet-de-loi-numerique/consultation/consultation');

        $em->persist($menuItem);
        $em->flush();
    }

    protected function generateMedias()
    {

        $em = $this->getContainer()->get('doctrine')->getManager();

        foreach ($em->getRepository('CapcoMediaBundle:Media')->findAll() as $media) {
            $media->setEnabled(false);
            // if ($media->getName() == 'Introduction') {
            //     $media->setEnabled(true);
            // }
        }
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
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

        $em = $this->getContainer()->get('doctrine')->getManager();

        $em->getRepository('CapcoUserBundle:User')
           ->findOneByEmail('admin@cap-collectif.com')
           ->setUsername('Cap Collectif')
           ;

        $user = $em->getRepository('CapcoUserBundle:User')
                   ->findOneByUsername($this->username);

        $progress = new ProgressBar($output, count($opinionTypesData) + count($opinions));
        $progress->start();

        $consultation = new Consultation();
        $consultation->setAuthor($user);
        $consultation->setTitle('Projet de loi numérique');

        $consultationAbsStep = new ConsultationAbstractStep();
        $consultationAbsStep->setPosition(1);

        $classementAbsStep = new ConsultationAbstractStep();
        $classementAbsStep->setPosition(2);

        $syntheseAbsStep = new ConsultationAbstractStep();
        $syntheseAbsStep->setPosition(3);

        $otherAbsStep = new ConsultationAbstractStep();
        $otherAbsStep->setPosition(4);

        $consultationStep = new ConsultationStep();
        $consultationStep->setTitle('Consultation');
        $consultationStep->setStartAt(new \DateTime());
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

        $consultationType = new ConsultationType();
        $consultationType->setTitle('PJL');

        $consultationStep->setConsultationType($consultationType);
        $consultationAbsStep->setStep($consultationStep);

        $classementAbsStep->setStep($classementStep);
        $syntheseAbsStep->setStep($syntheseStep);
        $otherAbsStep->setStep($otherStep);

        $consultation->addStep($consultationAbsStep);
        $consultation->addStep($classementAbsStep);
        $consultation->addStep($syntheseAbsStep);
        $consultation->addStep($otherAbsStep);

        $em->persist($consultation);
        $em->persist($consultationType);
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
                $parent = $this->findOpinionTypeByTitle($row['parent']);
                if (!$parent) {
                    throw new \Exception('Parent does not exist', 1);
                }
                $opinionType->setParent($parent);
            } else {
                $opinionType->setConsultationType($consultationType);
            }

            $em->persist($opinionType);
            $em->flush();
            $this->opinionTypes[] = $opinionType;
            ++$position;
            $progress->advance(1);
        }

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
            }

            $paragraphe = $row['paragraphe'];

            if (!empty($row['link'])) {
                $pos = strpos($paragraphe, $row['link']);
                if ($pos === false) {
                    throw new \Exception('Unable to find link', 1);
                }

                $modal = new OpinionModal();
                $modal->setOpinion($opinion);
                $modal->setTitle($row['modal_title']);
                $modal->setKey($row['link']);
                $modal->setBefore($row['modal_current']);
                $modal->setAfter($row['modal_next']);

                $em->persist($modal);
            }

            $content = $opinion->getBody();
            $content .= '<p>'.$paragraphe.'</p>';
            $opinion->setBody($content);

            $em->persist($opinion);
            $em->flush();
            $progress->advance(1);
        }

        foreach ($motives as $row) {
            $opinion = $em->getRepository('CapcoAppBundle:Opinion')
                          ->findOneByTitle($row['opinion']);

            if (!is_object($opinion)) {
                throw new \Exception('Unknown title', 1);
            }

            if (count($opinion->getAppendices()) === 0) {
                $motif = new OpinionAppendix();
                $motif->setAppendixType($exposayDayMotif);
                $motif->setBody('<p>'.$row['motif'].'</p>');
                $opinion->addAppendice($motif);
            } else {
                $motif = $opinion->getAppendices()[0];
                $content = $motif->getBody();
                $content .= '<p>'.$row['motif'].'</p>';
                $motif->setBody($content);
            }

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

    protected function getOpinionTypes()
    {
        return $this->getContainer()
                    ->get('import.csvtoarray')
                    ->convert('pjl/opinionTypes.csv');
    }
}
