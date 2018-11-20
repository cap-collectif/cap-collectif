<?php
namespace Capco\UserBundle\Form\Type;

use Capco\AppBundle\Form\ValueResponseType;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Valid;

class ApiRegistrationFormType extends AbstractType
{
    private $toggleManager;

    public function __construct(Manager $toggleManager)
    {
        $this->toggleManager = $toggleManager;
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        // disable password repeated
        $builder->remove('plainPassword')->add('plainPassword', PasswordType::class);
        $builder
            ->add('username', TextType::class, ['required' => true])
            ->add('email', TextType::class, ['required' => true]);

        $builder->add('captcha', ReCaptchaType::class, ['validation_groups' => ['registration']]);

        if ($this->toggleManager->isActive('user_type')) {
            $builder->add('userType', null, ['required' => false]);
        }

        if ($this->toggleManager->isActive('zipcode_at_register')) {
            $builder->add('zipcode', null, ['required' => false]);
        }

        $builder
            ->add('consentExternalCommunication', CheckboxType::class, ['required' => false])
            ->add('responses', CollectionType::class, [
                'allow_add' => true,
                'allow_delete' => false,
                'by_reference' => false,
                'entry_type' => ValueResponseType::class,
                'required' => false,
            ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'constraints' => new Valid(),
            'validation_groups' => ['registration'],
        ]);
    }
}
