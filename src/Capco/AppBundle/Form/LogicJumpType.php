<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\AbstractLogicJumpCondition;
use Capco\AppBundle\Entity\LogicJump;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Form\Type\RelayNodeType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class LogicJumpType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('id')
            ->add('position')
            ->add('origin', RelayNodeType::class, ['class' => AbstractQuestion::class])
            ->add('destination', RelayNodeType::class, ['class' => AbstractQuestion::class])
            ->add('conditions', CollectionType::class, [
                'allow_add' => true,
                'allow_delete' => true,
                'by_reference' => false,
                'entry_type' => LogicJumpConditionType::class,
                'delete_empty' => static function (AbstractLogicJumpCondition $condition = null) {
                    return null === $condition || (null === $condition->getOperator());
                }
            ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver
            ->setDefaults(['csrf_protection' => false, 'data_class' => LogicJump::class]);
    }
}
