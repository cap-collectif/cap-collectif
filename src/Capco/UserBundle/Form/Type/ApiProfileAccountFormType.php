<?php
namespace Capco\UserBundle\Form\Type;

use Capco\AppBundle\Validator\Constraints\NotThrowableEmail;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints as Assert;

class ApiProfileAccountFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('newEmailToConfirm', null, [
            'required' => true,
            'constraints' => [
                new Assert\NotNull(),
                new Assert\Email(['message' => 'email.invalid']),
                new NotThrowableEmail(['message' => 'email.throwable']),
            ],
        ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(['csrf_protection' => false]);
    }
}
