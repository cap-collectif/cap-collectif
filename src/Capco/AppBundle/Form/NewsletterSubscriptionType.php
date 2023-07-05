<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\NewsletterSubscription;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class NewsletterSubscriptionType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('email', EmailType::class, [
            'required' => true,
            'label' => 'homepage.newsletter.form.email',
        ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => NewsletterSubscription::class,
            'translation_domain' => 'CapcoAppBundle',
            'csrf_protection' => false,
        ]);
    }
}
