<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query\APIEnterprise;

use Capco\AppBundle\Manager\MediaManager;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\File\File;
use TCPDF;

class APIEnterprisePdfGenerator
{
    private $mediaManager;
    private $logger;

    public function __construct(MediaManager $mediaManager, LoggerInterface $logger)
    {
        $this->mediaManager = $mediaManager;
        $this->logger = $logger;
    }

    public function jsonToPdf(?string $content, string $path, string $filename): ?string
    {
        if (!$content) {
            return null;
        }

        try {
            $filenameWithExtension = $filename . '.pdf';
            $completePath = "${path}${filenameWithExtension}";
            $pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
            $pdf->AddPage();
            $pdf->writeHTML('<p>' . $content . '</p>');
            $pdf->writeHTML('<p> </p>');
            $pdf->writeHTML('<p>' . date('Y-m-d H:i:s') . '</p>');
            $pdf->Output($completePath, 'F');
        } catch (\RuntimeException $exception) {
            $this->logger->error(
                'An error occured while creating a pdf: ' . $exception->getMessage()
            );

            return null;
        }

        return $this->mediaManager->createFileFromFile(new File($completePath), $filename)->getId();
    }

    public function urlToPdf(?string $url, string $path, string $filename): ?string
    {
        $filenameWithExtension = $filename . '.pdf';
        if (!$url) {
            return null;
        }
        $completePath = "${path}${filenameWithExtension}";
        $copyResult = copy($url, $completePath);

        if (!$copyResult) {
            $this->logger->error(
                __METHOD__ .
                    ' : ' .
                    'An error occured while trying to 
            transform a distant document to local pdf at ' .
                    $completePath
            );

            return null;
        }

        return $this->mediaManager->createFileFromFile(new File($completePath), $filename)->getId();
    }
}
