<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Debate\DebateArticle;
use Capco\AppBundle\Form\Type\RelayGlobalIdType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\UrlType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class DebateArticleType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('id', RelayGlobalIdType::class)
            ->add('url', UrlType::class);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver
            ->setDefaults(['csrf_protection' => false, 'data_class' => DebateArticle::class]);
    }
}
