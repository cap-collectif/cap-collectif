<?php

namespace Capco\AppBundle\Form\Step;

use Capco\AppBundle\Entity\Status;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Enum\ViewConfiguration;
use Capco\AppBundle\Form\StatusFormType;
use Capco\AppBundle\Form\Type\OrderedCollectionType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\DateTimeType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class CollectStepFormType extends AbstractStepFormType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        parent::buildForm($builder, $options);
        $builder
            ->add('votesHelpText')
            ->add('private')
            ->add('voteType')
            ->add('budget')
            ->add('votesMin')
            ->add('votesLimit')
            ->add('votesRanking')
            ->add('voteThreshold')
            ->add('proposalForm')
            ->add('statuses', OrderedCollectionType::class, [
                'entry_type' => StatusFormType::class,
                'on_update' => static function (Status $itemFromDb, Status $itemFromUser) {
                    $itemFromDb
                        ->setName($itemFromUser->getName())
                        ->setColor($itemFromUser->getColor())
                    ;
                },
            ])
            ->add('secretBallot')
            ->add('publishedVoteDate', DateTimeType::class, [
                'widget' => 'single_text',
            ])
            ->add('defaultSort')
            ->add('defaultStatus')
            ->add('allowAuthorsToAddNews')
            ->add('mainView', ChoiceType::class, [
                'choices' => ViewConfiguration::ALL,
            ])
            ->add('proposalArchivedTime')
            ->add('proposalArchivedUnitTime')
            ->add('isCollectByEmailEnabled')
            ->add('preventProposalEdit')
            ->add('preventProposalDelete')
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => CollectStep::class,
        ]);
    }
}
