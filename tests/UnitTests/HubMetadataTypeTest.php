<?php

namespace CapcoTests\UnitTests;

use Capco\AppBundle\Entity\HubMetadata;
use Capco\AppBundle\Form\HubMetadataType;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Form\Extension\Core\CoreExtension;
use Symfony\Component\Form\Extension\Validator\ValidatorExtension;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\Forms;
use Symfony\Component\Validator\Validation;

/**
 * @internal
 * @coversNothing
 */
class HubMetadataTypeTest extends TestCase
{
    public function testMetadataIsOptionalWhenAssociationIsDisabled(): void
    {
        $form = $this->createForm(false);
        $form->submit([
            'enabled' => false,
            'aiotCode' => '',
            'folderNumber' => '',
            'contactEmail' => '',
        ]);

        self::assertTrue($form->isValid());
    }

    public function testMetadataIsRequiredWhenAssociationIsEnabled(): void
    {
        $form = $this->createForm(true);
        $form->submit([
            'enabled' => true,
            'aiotCode' => '',
            'folderNumber' => '',
            'contactEmail' => '',
        ]);

        self::assertFalse($form->isValid());
    }

    private function createForm(bool $required): FormInterface
    {
        return Forms::createFormFactoryBuilder()
            ->addExtension(new CoreExtension())
            ->addExtension(new ValidatorExtension(Validation::createValidator()))
            ->getFormFactory()
            ->create(HubMetadataType::class, new HubMetadata(), [
                'hub_metadata_required' => $required,
            ])
        ;
    }
}
