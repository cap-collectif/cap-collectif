<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

class Version20170530150306 extends AbstractMigration implements ContainerAwareInterface
{
    protected $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function up(Schema $schema): void
    {
        // $stepRepo = $this->container->get('capco.consultation_step.repository');
        // $typeRepo = $this->container->get('capco.opinion_type.repository');
        // $opinionRepo = $this->container->get('capco.opinion.repository');
        // $em = $this->container->get('doctrine.orm.default_entity_manager');
        // $steps = $stepRepo->findAll();
        // $doneStepsIds = [];
        // foreach ($steps as $step) {
        //     echo 'Exploring step: ' . $step->getSlug() . "\n";
        //     if (!in_array($step->getId(), $doneStepsIds, true) && $step->getConsultationStepType() !== null) {
        //         $currentType = $step->getConsultationStepType();
        //         $stepsWithSameType = [];
        //         foreach ($steps as $otherStep) {
        //             if (
        //               $otherStep->getId() !== $step->getId()
        //               && $otherStep->getConsultationStepType() !== null
        //               && $currentType->getId() === $otherStep->getConsultationStepType()->getId()
        //             ) {
        //                 $stepsWithSameType[] = $otherStep;
        //                 $doneStepsIds[] = $otherStep->getId();
        //             }
        //         }
        //         $types = $typeRepo->findBy(['consultationStepType' => $currentType]);
        //         foreach ($stepsWithSameType as $stepToFix) {
        //             echo 'Fixing step: ' . $stepToFix->getSlug() . "\n";
        //             $stepType = new ConsultationStepType();
        //             $stepType->setTitle($currentType->getTitle());
        //             $em->persist($stepType);
        //             $stepToFix->setConsultationStepType($stepType);
        //             $em->flush();
        //
        //             foreach ($types as $type) {
        //                 echo 'Cloning type: ' . $type->getSlug() . "\n";
        //                 $copy = new OpinionType();
        //                 $copy->setTitle($type->getTitle());
        //                 $copy->setPosition($type->getPosition());
        //                 $copy->setIsEnabled($type->getIsEnabled());
        //                 $copy->setVoteWidgetType($type->getVoteWidgetType());
        //                 $copy->setColor($type->getColor());
        //                 $copy->setVotesHelpText($type->getVotesHelpText());
        //                 $copy->setVersionable($type->isVersionable());
        //                 $copy->setSourceable($type->isSourceable());
        //                 $copy->setCommentSystem($type->getCommentSystem());
        //                 $copy->setSubtitle($type->getSubtitle());
        //                 $copy->setLinkable($type->isLinkable());
        //                 $copy->setDefaultFilter($type->getDefaultFilter());
        //
        //                 $copy->setParent(null); // TODO
        //                 $copy->setConsultationStepType($stepType);
        //
        //                 $em->persist($copy);
        //                 $em->flush();
        //
        //                 $opinions = $opinionRepo->findBy(['OpinionType' => $type, 'step' => $stepToFix]);
        //                 foreach ($opinions as $opinion) {
        //                     $opinion->setOpinionType($copy);
        //                 }
        //                 $em->flush();
        //             }
        //         }
        //     }
        //}
    }

    public function down(Schema $schema): void
    {
    }
}
