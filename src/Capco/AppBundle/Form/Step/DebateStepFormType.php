<?php

namespace Capco\AppBundle\Form\Step;

use Capco\AppBundle\Entity\Debate\DebateArticle;
use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Form\DebateArticleType;
use Capco\AppBundle\Form\Type\OrderedCollectionType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class DebateStepFormType extends AbstractStepFormType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        parent::buildForm($builder, $options);
        $builder
            ->add('articles', OrderedCollectionType::class, [
                'entry_type' => DebateArticleType::class,
                'on_update' => static function (
                    DebateArticle $itemFromDb,
                    DebateArticle $itemFromUser
                ) {
                    $itemFromDb
                        ->setUrl($itemFromUser->getUrl());
                }
            ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => DebateStep::class,
        ]);
    }
}
